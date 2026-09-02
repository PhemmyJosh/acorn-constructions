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

/** Extension and MIME must agree, so a renamed file cannot slip through. */
const ALLOWED_IMAGES: { extensions: string[]; mimes: string[] }[] = [
  { extensions: [".jpg", ".jpeg"], mimes: ["image/jpeg"] },
  { extensions: [".png"], mimes: ["image/png"] },
  { extensions: [".webp"], mimes: ["image/webp"] },
];

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
 * Validation order mirrors the resume upload: type allowlist, then size, then
 * the write itself.
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
        Body: Buffer.from(await file.arrayBuffer()),
        // Derived from the validated extension rather than the browser's
        // claim, so the object is always served with a correct type.
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
