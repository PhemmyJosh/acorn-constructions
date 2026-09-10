import { unlink } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  IMAGE_MAX_BYTES,
  IMAGE_MAX_MB,
  UPLOAD_DIR_RELATIVE,
} from "@/lib/content-constants";
import { isR2Url, r2Client, r2Config, r2KeyFromUrl } from "@/lib/r2";

/**
 * Project photo storage, backed by Cloudflare R2.
 *
 * These used to be written to public/uploads/projects/ on the server's disk.
 * That failed twice over on Hostinger: each deploy builds into a fresh
 * directory from a Git checkout, so uploads were deleted on the next deploy;
 * and `next start` snapshots public/ at boot, so a newly written file was not
 * even served until the process restarted — next/image received the 404 HTML
 * page and answered "The requested resource isn't a valid image."
 *
 * Serving from R2's own domain removes both problems: the file never touches
 * the app's filesystem, and next/image fetches it as an ordinary remote image.
 *
 * Server-only.
 */

type ImageFormat = "jpeg" | "png" | "webp";

/** Extension and MIME must agree, so a renamed file cannot slip through. */
const ALLOWED_IMAGES: {
  format: ImageFormat;
  extensions: string[];
  mimes: string[];
}[] = [
  { format: "jpeg", extensions: [".jpg", ".jpeg"], mimes: ["image/jpeg"] },
  { format: "png", extensions: [".png"], mimes: ["image/png"] },
  { format: "webp", extensions: [".webp"], mimes: ["image/webp"] },
];

/** Longest signature we inspect is WEBP's, which needs bytes 0-11. */
const SIGNATURE_BYTES = 12;

/**
 * Identifies an image by its leading bytes, ignoring the filename entirely.
 *
 * This exists because neither of the other two checks looks at the file's
 * contents: the extension is chosen by whoever uploads, and `file.type` is
 * supplied by the client. A file renamed from `.avif` to `.jpg` satisfies both.
 * It would then be stored in R2 with `Content-Type: image/jpeg` from its
 * extension, and next/image would later sniff the *real* bytes, recognise AVIF
 * and hand it to sharp to decode through libheif — the path GHSA-2xp9-vwfh-vxw4
 * describes, which `images.formats` cannot close because that setting governs
 * output encoding only. See the review in DEPLOYMENT.md.
 *
 * Returns null for anything that is not one of the three formats we accept.
 */
function detectImageFormat(bytes: Buffer): ImageFormat | null {
  if (bytes.length < SIGNATURE_BYTES) return null;

  // FF D8 FF — SOI marker followed by the first segment's marker.
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";

  // 89 "PNG" CR LF SUB LF. The trailing bytes are the deliberate check for
  // transmission that mangles line endings, so all eight are worth matching.
  if (
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png";
  }

  // A RIFF container whose form type is WEBP. Bytes 4-7 are the chunk length
  // and vary, so they are skipped rather than matched.
  if (
    bytes.subarray(0, 4).toString("latin1") === "RIFF" &&
    bytes.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

/**
 * Names a rejected file's real format where we can recognise it, so the error
 * can say what was wrong rather than just that something was.
 *
 * Worth the extra code for one case in particular: an admin with a genuine
 * AVIF photo would otherwise be told their valid image is invalid, with no clue
 * that converting it would fix things.
 */
function describeForeignFormat(bytes: Buffer): string | null {
  if (bytes.length < SIGNATURE_BYTES) return null;

  // ISO base media container: "ftyp" at byte 4, brand at byte 8.
  if (bytes.subarray(4, 8).toString("latin1") === "ftyp") {
    const brand = bytes.subarray(8, 12).toString("latin1");
    if (brand === "avif" || brand === "avis") return "an AVIF";
    if (["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand)) {
      return "a HEIC";
    }
    return "a HEIF-family";
  }

  const head = bytes.subarray(0, 6).toString("latin1");
  if (head.startsWith("GIF87a") || head.startsWith("GIF89a")) return "a GIF";
  if (head.startsWith("BM")) return "a BMP";
  if (head.startsWith("%PDF")) return "a PDF";
  if (head.startsWith("II*\0") || head.startsWith("MM\0*")) return "a TIFF";

  return null;
}

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** Objects are namespaced so the bucket can hold other things later. */
const KEY_PREFIX = "projects";

/**
 * Builds a collision-proof, path-safe object key: a timestamp plus the
 * sanitized original stem, so files stay recognisable in the bucket listing
 * without any character that would need escaping in a URL.
 */
export function buildFilename(originalName: string): string {
  const extension = path.extname(originalName).toLowerCase();
  const stem = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${Date.now()}-${stem || "photo"}${extension}`;
}

export interface UploadResult {
  /** Full public URL of the stored object, written to projects.image_filename. */
  url?: string;
  error?: string;
}

/**
 * Validates one uploaded image and puts it in the bucket.
 *
 * Three independent checks, deliberately layered rather than one replacing
 * another — each catches something the others cannot:
 *
 *   1. the extension, which is what the object's stored Content-Type is
 *      derived from, so it has to be one we accept;
 *   2. `file.type`, the client's own claim, which corroborates the extension
 *      when present;
 *   3. the leading bytes, the only check that looks at the actual contents and
 *      so the only one an attacker cannot simply choose.
 *
 * Ordered cheapest-first, and the byte check comes after the size limit so an
 * oversized file is rejected before anything reads it into memory.
 */
export async function saveProjectImage(file: File): Promise<UploadResult> {
  const lowerName = file.name.toLowerCase();
  const match = ALLOWED_IMAGES.find((allowed) =>
    allowed.extensions.some((extension) => lowerName.endsWith(extension))
  );

  if (!match) {
    return { error: "Image must be a JPG, PNG or WEBP file." };
  }
  // file.type is browser-supplied, so it corroborates the extension rather
  // than being the only check; an empty type (some clients omit it) is fine.
  if (file.type && !match.mimes.includes(file.type)) {
    return { error: "That file's contents don't match its extension." };
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return { error: `Image must be smaller than ${IMAGE_MAX_MB}MB.` };
  }
  if (file.size === 0) {
    return { error: "That image appears to be empty." };
  }

  // Read once and reuse for the upload below, so a 5MB photo is not pulled
  // into memory twice just to inspect its first twelve bytes.
  let bytes: Buffer;
  try {
    bytes = Buffer.from(await file.arrayBuffer());
  } catch (error) {
    console.error("[content] Could not read the uploaded image:", error);
    return { error: "Could not read that image. Please try again." };
  }

  const actualFormat = detectImageFormat(bytes);
  if (!actualFormat) {
    const foreign = describeForeignFormat(bytes);
    console.warn(
      `[content] Rejected upload "${file.name}": signature is not JPEG/PNG/WEBP` +
        `${foreign ? ` (looks like ${foreign} file)` : ""}`
    );
    return {
      error: foreign
        ? `That looks like ${foreign} file, not a JPG, PNG or WEBP. Convert it and try again.`
        : "This file doesn't appear to be a valid JPG, PNG, or WEBP image.",
    };
  }
  if (actualFormat !== match.format) {
    // Both formats are ones we accept, but the extension decides the stored
    // Content-Type, so letting this through would serve the object mislabelled.
    console.warn(
      `[content] Rejected upload "${file.name}": ${actualFormat} bytes with a ` +
        `${match.format} extension`
    );
    return {
      error: `That file's contents are ${actualFormat.toUpperCase()}, which doesn't match its ${path
        .extname(lowerName)
        .toUpperCase()} extension. Rename or convert it and try again.`,
    };
  }

  const config = r2Config();
  if (!config) {
    // Loud, not silent. Falling back to local disk here would quietly
    // reintroduce the bug this storage move exists to fix.
    console.error(
      "[content] R2 is not configured; set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, " +
        "R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME and R2_PUBLIC_URL."
    );
    return {
      error:
        "Image storage isn't configured on the server, so the photo wasn't saved. Please contact your developer.",
    };
  }

  const extension = path.extname(lowerName);
  const key = `${KEY_PREFIX}/${buildFilename(file.name)}`;

  try {
    await r2Client(config).send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: bytes,
        // Derived from the validated extension rather than the browser's
        // claim, and now corroborated against the file's real signature above,
        // so the object is always served with a correct type.
        ContentType: CONTENT_TYPE_BY_EXTENSION[extension] ?? "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
  } catch (error) {
    console.error("[content] Failed to upload image to R2:", error);
    return { error: "Could not save that image. Please try again." };
  }

  console.log(`[content] Uploaded ${key} to R2`);
  return { url: `${config.publicUrl}/${key}` };
}

/**
 * True when the app owns the stored file, i.e. deleting the row should delete
 * the file too. Covers R2 objects and any legacy bare filename left over from
 * the local-disk era; stock photography URLs (Pexels) are not ours to delete.
 */
export function isManagedUpload(imageFilename: string | null): boolean {
  if (!imageFilename) return false;
  if (isR2Url(imageFilename)) return true;
  return !/^https?:\/\//i.test(imageFilename);
}

/**
 * Removes a stored photo. A missing object is not an error — the goal is only
 * that nothing is left orphaned.
 */
export async function deleteProjectImage(
  imageFilename: string | null
): Promise<void> {
  if (!imageFilename) return;

  const key = r2KeyFromUrl(imageFilename);
  if (key) {
    const config = r2Config();
    if (!config) return;
    try {
      await r2Client(config).send(
        new DeleteObjectCommand({ Bucket: config.bucket, Key: key })
      );
      console.log(`[content] Deleted ${key} from R2`);
    } catch (error) {
      console.error(`[content] Could not delete ${key} from R2:`, error);
    }
    return;
  }

  // Any other absolute URL is stock photography, not ours.
  if (/^https?:\/\//i.test(imageFilename)) return;

  // Legacy local file from before the R2 migration. Kept so a leftover row
  // still tidies up after itself; safe to remove once none remain.
  const safeName = path.basename(imageFilename);
  try {
    await unlink(
      path.join(
        process.cwd(),
        "public",
        ...UPLOAD_DIR_RELATIVE.split("/"),
        safeName
      )
    );
    console.log(`[content] Deleted legacy local image ${safeName}`);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error(`[content] Could not delete local image ${safeName}:`, error);
    }
  }
}
