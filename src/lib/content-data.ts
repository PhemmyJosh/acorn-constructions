import { query } from "@/lib/db";
import { projects as staticProjects } from "@/data/projects";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import { categoryLabel, projectImageSrc } from "@/lib/content-constants";
import type {
  ProjectRow,
  ServiceContentRow,
  TestimonialRow,
} from "@/lib/content-constants";
import type { Project, ProjectCategory, Testimonial } from "@/types";

/**
 * Server-side reads of the client-editable content tables.
 *
 * This module touches mysql2, so it must never be imported from a client
 * component — the browser-safe pieces live in content-constants.ts.
 *
 * Every public getter falls back to the hardcoded data in src/data/ when the
 * table is empty or the database is unreachable, so a fresh install (or a
 * database blip) renders the original site rather than an empty one.
 */

// Re-exported so server components have a single import for content concerns.
export * from "@/lib/content-constants";

/* -------------------------------------------------------------------------- */
/* Admin reads (raw rows, including unpublished)                               */
/* -------------------------------------------------------------------------- */

export async function getProjectRows(): Promise<ProjectRow[]> {
  return query<ProjectRow>(
    "SELECT * FROM projects ORDER BY display_order ASC, id ASC"
  );
}

export async function getTestimonialRows(): Promise<TestimonialRow[]> {
  return query<TestimonialRow>(
    "SELECT * FROM testimonials ORDER BY display_order ASC, id ASC"
  );
}

export async function getServiceContentRows(): Promise<ServiceContentRow[]> {
  return query<ServiceContentRow>("SELECT * FROM service_content");
}

/* -------------------------------------------------------------------------- */
/* Public site reads (with fallbacks)                                          */
/* -------------------------------------------------------------------------- */

/** The shape the gallery components already consume. */
export interface GalleryProject extends Project {
  caption: string | null;
  description: string | null;
}

function toGalleryProject(row: ProjectRow): GalleryProject {
  return {
    id: String(row.id),
    title: row.title,
    category: categoryLabel(row.category) as ProjectCategory,
    image: projectImageSrc(row.image_filename) ?? "",
    alt: row.caption || row.title,
    caption: row.caption,
    description: row.description,
  };
}

const staticGalleryProjects: GalleryProject[] = staticProjects.map((p) => ({
  ...p,
  caption: p.alt,
  description: null,
}));

export async function getGalleryProjects(): Promise<GalleryProject[]> {
  try {
    const rows = await getProjectRows();
    // A row with no image would render as a gap in the masonry grid.
    const usable = rows.filter((row) => row.image_filename);
    if (usable.length === 0) return staticGalleryProjects;
    return usable.map(toGalleryProject);
  } catch (error) {
    console.error("[content] Falling back to static projects:", error);
    return staticGalleryProjects;
  }
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const rows = await query<TestimonialRow>(
      `SELECT * FROM testimonials
        WHERE is_published = 1
        ORDER BY display_order ASC, id ASC`
    );
    if (rows.length === 0) return staticTestimonials;
    return rows.map((row) => ({
      quote: row.quote,
      name: row.client_name,
      role: row.client_role ?? "",
      location: row.client_location ?? "",
    }));
  } catch (error) {
    console.error("[content] Falling back to static testimonials:", error);
    return staticTestimonials;
  }
}

/**
 * Overview copy for one service, split back into paragraphs.
 *
 * Returns null when there is no row yet (or the database is unreachable) and
 * the caller keeps using the hardcoded copy — the safety net during rollout.
 */
export async function getServiceOverview(
  slug: string
): Promise<string[] | null> {
  try {
    const rows = await query<ServiceContentRow>(
      "SELECT overview_text FROM service_content WHERE service_slug = ?",
      [slug]
    );
    const text = rows[0]?.overview_text?.trim();
    if (!text) return null;
    return text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("[content] Falling back to static service copy:", error);
    return null;
  }
}
