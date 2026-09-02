"use server";

import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin-auth";
import { execute, query } from "@/lib/db";
import { toCategoryKey, type ProjectRow, type TestimonialRow } from "@/lib/content-data";
import { deleteProjectImage, saveProjectImage } from "@/lib/content-upload";
import { IMAGE_MAX_BYTES, IMAGE_MAX_MB } from "@/lib/content-constants";

/**
 * Content CRUD for the admin's Projects / Testimonials / Services tabs.
 *
 * Server actions are POST endpoints in their own right, so every one of these
 * re-checks the session rather than assuming the page rendered it.
 */

async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Not authorized.");
  }
}

function text(value: FormDataEntryValue | null, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function nullable(value: FormDataEntryValue | null, maxLength: number): string | null {
  const trimmed = text(value, maxLength);
  return trimmed === "" ? null : trimmed;
}

function toId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** Errors surface as ?error= on the redirect, so the panel can show them. */
function back(tab: string, error?: string): never {
  const params = new URLSearchParams({ tab });
  if (error) params.set("error", error);
  redirect(`/admin?${params.toString()}`);
}

/**
 * Runs the body of an action and turns any unexpected throw into a message.
 *
 * Every action below used to let a failed query or a failed R2 call propagate,
 * which does not surface as a form error — it propagates into rendering and
 * blanks the dashboard with "the site could not load". This converts that into
 * the same ?error= banner a validation failure already uses.
 *
 * `redirect()` works by throwing a NEXT_REDIRECT error, so it must never be
 * called inside `work`, or this would catch the redirect and report it as a
 * failure. Keeping every redirect at the call site — after this returns — is
 * why the actions are shaped the way they are, rather than sniffing error
 * digests to tell a real fault from control flow.
 *
 * @returns an error message to show, or null on success.
 */
async function guard(
  label: string,
  work: () => Promise<string | null>
): Promise<string | null> {
  try {
    return await work();
  } catch (error) {
    console.error(`[content] ${label} failed:`, error);
    return "Something went wrong saving that. Nothing was changed — please try again.";
  }
}

/** Puts a new row at the end of the list. */
async function nextOrder(table: "projects" | "testimonials"): Promise<number> {
  const rows = await query<{ next: number | null }>(
    `SELECT MAX(display_order) AS next FROM ${table}`
  );
  return Number(rows[0]?.next ?? 0) + 10;
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

export async function saveProject(formData: FormData): Promise<void> {
  await requireAdmin();

  const error = await guard("saveProject", () => saveProjectWork(formData));
  if (error) back("projects", error);
  redirect("/admin?tab=projects");
}

/** The work itself. Returns a message to show, or null when it succeeded. */
async function saveProjectWork(formData: FormData): Promise<string | null> {
  const id = toId(formData.get("id"));
  const title = text(formData.get("title"), 255);
  const category = toCategoryKey(formData.get("category"));
  const caption = nullable(formData.get("caption"), 500);
  const description = nullable(formData.get("description"), 5000);

  if (!title) return "A project needs a title.";

  const upload = formData.get("image");
  // The stored value is the object's full public URL, so every consumer —
  // next/image, the admin thumbnail, the public gallery — treats R2 photos and
  // the seeded stock URLs through exactly one code path.
  let newImageUrl: string | null = null;

  if (upload instanceof File && upload.size > 0) {
    // Checked before saveProjectImage so an oversized file is refused with a
    // specific message naming its size, rather than the generic one.
    if (upload.size > IMAGE_MAX_BYTES) {
      return `That photo is ${(upload.size / 1024 / 1024).toFixed(
        1
      )}MB. Choose one under ${IMAGE_MAX_MB}MB.`;
    }
    const result = await saveProjectImage(upload);
    if (result.error) return result.error;
    newImageUrl = result.url ?? null;
  }

  if (id === null) {
    // New projects must have an image, otherwise the gallery renders a gap.
    if (!newImageUrl) return "Choose an image for the new project.";

    const order = await nextOrder("projects");
    await execute(
      `INSERT INTO projects
         (title, category, image_filename, caption, description, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, category, newImageUrl, caption, description, order]
    );
    console.log(`[content] Created project "${title}"`);
    return null;
  }

  const existing = await query<ProjectRow>(
    "SELECT * FROM projects WHERE id = ?",
    [id]
  );
  const current = existing[0];
  if (!current) return "That project no longer exists.";

  await execute(
    `UPDATE projects
        SET title = ?, category = ?, caption = ?, description = ?
            ${newImageUrl ? ", image_filename = ?" : ""}
      WHERE id = ?`,
    newImageUrl
      ? [title, category, caption, description, newImageUrl, id]
      : [title, category, caption, description, id]
  );

  // Only once the row points at the new file, so a failed update never leaves
  // the row referencing something already deleted.
  if (newImageUrl) {
    await deleteProjectImage(current.image_filename);
  }

  console.log(`[content] Updated project ${id}`);
  return null;
}

export async function deleteProject(formData: FormData): Promise<void> {
  await requireAdmin();

  const error = await guard("deleteProject", async () => {
    const id = toId(formData.get("id"));
    if (id === null) return null;

    const rows = await query<ProjectRow>(
      "SELECT image_filename FROM projects WHERE id = ?",
      [id]
    );

    await execute("DELETE FROM projects WHERE id = ?", [id]);
    // The row is gone, so the file is now unreachable either way; removing it
    // keeps the bucket free of orphans.
    await deleteProjectImage(rows[0]?.image_filename ?? null);

    console.log(`[content] Deleted project ${id}`);
    return null;
  });

  if (error) back("projects", error);
  redirect("/admin?tab=projects");
}

/* -------------------------------------------------------------------------- */
/* Testimonials                                                                */
/* -------------------------------------------------------------------------- */

export async function saveTestimonial(formData: FormData): Promise<void> {
  await requireAdmin();

  const error = await guard("saveTestimonial", () => saveTestimonialWork(formData));
  if (error) back("testimonials", error);
  redirect("/admin?tab=testimonials");
}

async function saveTestimonialWork(formData: FormData): Promise<string | null> {
  const id = toId(formData.get("id"));
  const name = text(formData.get("client_name"), 255);
  const role = nullable(formData.get("client_role"), 255);
  const location = nullable(formData.get("client_location"), 255);
  const quote = text(formData.get("quote"), 5000);
  const isPublished = formData.get("is_published") === "on" ? 1 : 0;

  if (!name) return "A testimonial needs a client name.";
  if (!quote) return "A testimonial needs a quote.";

  if (id === null) {
    const order = await nextOrder("testimonials");
    await execute(
      `INSERT INTO testimonials
         (client_name, client_role, client_location, quote, is_published, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, role, location, quote, isPublished, order]
    );
    console.log(`[content] Created testimonial for ${name}`);
  } else {
    await execute(
      `UPDATE testimonials
          SET client_name = ?, client_role = ?, client_location = ?,
              quote = ?, is_published = ?
        WHERE id = ?`,
      [name, role, location, quote, isPublished, id]
    );
    console.log(`[content] Updated testimonial ${id}`);
  }

  return null;
}

export async function deleteTestimonial(formData: FormData): Promise<void> {
  await requireAdmin();

  const error = await guard("deleteTestimonial", async () => {
    const id = toId(formData.get("id"));
    if (id === null) return null;

    await execute("DELETE FROM testimonials WHERE id = ?", [id]);
    console.log(`[content] Deleted testimonial ${id}`);
    return null;
  });

  if (error) back("testimonials", error);
  redirect("/admin?tab=testimonials");
}

/** Publish/unpublish without opening the edit form. */
export async function toggleTestimonialPublished(
  formData: FormData
): Promise<void> {
  await requireAdmin();

  const error = await guard("toggleTestimonialPublished", async () => {
    const id = toId(formData.get("id"));
    if (id === null) return null;

    await execute(
      "UPDATE testimonials SET is_published = 1 - is_published WHERE id = ?",
      [id]
    );

    const rows = await query<TestimonialRow>(
      "SELECT is_published FROM testimonials WHERE id = ?",
      [id]
    );
    console.log(
      `[content] Testimonial ${id} is now ${rows[0]?.is_published ? "published" : "unpublished"}`
    );
    return null;
  });

  if (error) back("testimonials", error);
  redirect("/admin?tab=testimonials");
}

/* -------------------------------------------------------------------------- */
/* Reordering                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Swaps a row's display_order with its neighbour in the given direction.
 *
 * Swapping beats renumbering the whole list: it is two updates regardless of
 * how many rows exist, and it cannot corrupt the ordering if one fails. Ties
 * are broken by id, matching the ORDER BY used everywhere these are read.
 */
export async function moveContent(formData: FormData): Promise<void> {
  await requireAdmin();

  const table = formData.get("table") === "testimonials" ? "testimonials" : "projects";
  const error = await guard("moveContent", () => moveContentWork(formData, table));

  if (error) back(table, error);
  redirect(`/admin?tab=${table}`);
}

async function moveContentWork(
  formData: FormData,
  table: "projects" | "testimonials"
): Promise<string | null> {
  const id = toId(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";
  if (id === null) return null;

  const rows = await query<{ id: number; display_order: number }>(
    `SELECT id, display_order FROM ${table} ORDER BY display_order ASC, id ASC`
  );
  const index = rows.findIndex((row) => row.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;

  // Already at the end it was asked to move towards; nothing to do, and not an
  // error worth showing — the button is disabled at the ends anyway.
  if (index === -1 || swapWith < 0 || swapWith >= rows.length) {
    return null;
  }

  const a = rows[index];
  const b = rows[swapWith];

  // Equal display_order values would otherwise leave the pair unmoved, since
  // the tiebreaker is id; nudge one so the swap is always visible.
  const orderA = a.display_order === b.display_order ? b.display_order + (direction === "up" ? -1 : 1) : b.display_order;

  await execute(`UPDATE ${table} SET display_order = ? WHERE id = ?`, [
    orderA,
    a.id,
  ]);
  await execute(`UPDATE ${table} SET display_order = ? WHERE id = ?`, [
    a.display_order,
    b.id,
  ]);

  return null;
}

/* -------------------------------------------------------------------------- */
/* Service copy                                                                */
/* -------------------------------------------------------------------------- */

export async function saveServiceContent(formData: FormData): Promise<void> {
  await requireAdmin();

  const error = await guard("saveServiceContent", async () => {
    const slug = text(formData.get("service_slug"), 191);
    const overview = text(formData.get("overview_text"), 20000);

    if (!slug) return "Missing service.";

    // One row per slug; upsert so it works whether or not the seed has run.
    await execute(
      `INSERT INTO service_content (service_slug, overview_text)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE overview_text = VALUES(overview_text)`,
      [slug, overview || null]
    );

    console.log(`[content] Updated service copy for ${slug}`);
    return null;
  });

  if (error) back("services", error);
  redirect("/admin?tab=services");
}
