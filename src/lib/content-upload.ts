import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_BYTES,
  IMAGE_MAX_MB,
  UPLOAD_DIR_RELATIVE,
  isUploadedFile,
} from "@/lib/content-constants";

/**
 * Project photos are stored as real files under public/, not as database
 * BLOBs: they will grow steadily, and next/image can only optimise something
 * it can fetch as a URL.
 *
 * This needs a persistent filesystem. That is fine on the Node hosting this
 * site is going to (see DEPLOYMENT.md) but would not survive on an ephemeral
 * serverless platform, where these would have to move to object storage.
 */

/** Extension and MIME must agree, so a renamed file cannot slip through. */
const ALLOWED_IMAGES: { extensions: string[]; mimes: string[] }[] = [
  { extensions: [".jpg", ".jpeg"], mimes: ["image/jpeg"] },
  { extensions: [".png"], mimes: ["image/png"] },
  { extensions: [".webp"], mimes: ["image/webp"] },
];

function uploadRoot(): string {
  return path.join(process.cwd(), "public", ...UPLOAD_DIR_RELATIVE.split("/"));
}

/**
 * Builds a collision-proof, path-safe name: a timestamp plus the sanitized
 * original stem, so files stay recognisable in the folder without ever being
 * able to escape it.
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
  filename?: string;
  error?: string;
}

/**
 * Validates and writes one uploaded image. Mirrors the resume upload checks:
 * type allowlist first, then size, then write.
 */
export async function saveProjectImage(file: File): Promise<UploadResult> {
  const lowerName = file.name.toLowerCase();
  const match = ALLOWED_IMAGES.find((allowed) =>
    allowed.extensions.some((extension) => lowerName.endsWith(extension))
  );

  if (!match) {
    return { error: "Image must be a JPG, PNG or WEBP file." };
  }
  // file.type is browser-supplied, so it is a corroborating check rather than
  // the only one; an empty type (some clients omit it) is tolerated.
  if (file.type && !match.mimes.includes(file.type)) {
    return { error: "That file's contents don't match its extension." };
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return { error: `Image must be smaller than ${IMAGE_MAX_MB}MB.` };
  }
  if (file.size === 0) {
    return { error: "That image appears to be empty." };
  }

  const filename = buildFilename(file.name);
  const directory = uploadRoot();

  try {
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, filename),
      Buffer.from(await file.arrayBuffer())
    );
  } catch (error) {
    console.error("[content] Failed to write uploaded image:", error);
    return { error: "Could not save that image. Please try again." };
  }

  return { filename };
}

/**
 * Removes an uploaded file from disk. Absolute URLs (the seeded stock photos)
 * are skipped, and a missing file is not an error — the goal is simply that no
 * orphan is left behind.
 */
export async function deleteProjectImage(
  imageFilename: string | null
): Promise<void> {
  if (!isUploadedFile(imageFilename)) return;

  // Defence in depth: only ever unlink a bare filename inside the upload dir.
  const safeName = path.basename(imageFilename!);
  try {
    await unlink(path.join(uploadRoot(), safeName));
    console.log(`[content] Deleted image file ${safeName}`);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error(`[content] Could not delete image ${safeName}:`, error);
    }
  }
}

export { IMAGE_ACCEPT, IMAGE_MAX_BYTES, IMAGE_MAX_MB };
