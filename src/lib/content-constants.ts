/**
 * Content values that are safe to import from client components.
 *
 * Kept apart from content-data.ts and content-upload.ts on purpose: those pull
 * in mysql2 and node:fs, which cannot be bundled for the browser. Anything a
 * "use client" file needs — category options, image path helpers, upload
 * limits, row types — lives here instead.
 */

/* -------------------------------------------------------------------------- */
/* Categories                                                                  */
/* -------------------------------------------------------------------------- */

/** Schema enum keys, paired with the label shown on the site. */
export const PROJECT_CATEGORIES = [
  { key: "residential", label: "Residential" },
  { key: "commercial", label: "Commercial" },
  { key: "foundations", label: "Foundations" },
  { key: "post_frame", label: "Post Frame" },
] as const;

export type ProjectCategoryKey = (typeof PROJECT_CATEGORIES)[number]["key"];

export function categoryLabel(key: string): string {
  return PROJECT_CATEGORIES.find((c) => c.key === key)?.label ?? "Residential";
}

/** Query values are matched against the enum, never trusted directly. */
export function toCategoryKey(value: unknown): ProjectCategoryKey {
  return PROJECT_CATEGORIES.some((c) => c.key === value)
    ? (value as ProjectCategoryKey)
    : "residential";
}

/* -------------------------------------------------------------------------- */
/* Image paths and upload limits                                               */
/* -------------------------------------------------------------------------- */

export const UPLOAD_DIR_RELATIVE = "uploads/projects";

export const IMAGE_MAX_MB = 5;
export const IMAGE_MAX_BYTES = IMAGE_MAX_MB * 1024 * 1024;
export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp";

/**
 * `image_filename` holds either an absolute URL (the seeded stock photography)
 * or a bare filename uploaded through the admin. Both end up as a `src` that
 * next/image can optimise — local files are same-origin so they need no
 * remotePatterns entry.
 */
export function projectImageSrc(imageFilename: string | null): string | null {
  if (!imageFilename) return null;
  if (/^https?:\/\//i.test(imageFilename)) return imageFilename;
  return `/${UPLOAD_DIR_RELATIVE}/${imageFilename}`;
}

/** True for values that point at a file on disk rather than a remote URL. */
export function isUploadedFile(imageFilename: string | null): boolean {
  if (!imageFilename) return false;
  return !/^https?:\/\//i.test(imageFilename);
}

/* -------------------------------------------------------------------------- */
/* Row shapes                                                                  */
/* -------------------------------------------------------------------------- */

export interface ProjectRow {
  id: number;
  title: string;
  category: string;
  image_filename: string | null;
  caption: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TestimonialRow {
  id: number;
  client_name: string;
  client_role: string | null;
  client_location: string | null;
  quote: string;
  is_published: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceContentRow {
  service_slug: string;
  overview_text: string | null;
  updated_at: string;
}
