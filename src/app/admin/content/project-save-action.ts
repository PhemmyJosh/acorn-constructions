"use server";

import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/admin-auth";
import { execute, query } from "@/lib/db";
import { toCategoryKey, type ProjectRow } from "@/lib/content-data";
import { deleteProjectImage, saveProjectImage } from "@/lib/content-upload";
import { IMAGE_MAX_MB } from "@/lib/content-constants";
// Type-only import: erased at compile time, so it adds no non-function export
// to this "use server" module.
import type { ProjectSaveState } from "./project-save-state";

/**
 * Create-or-update for the project overlay.
 *
 * Separate from the redirect-driven actions in content-actions.ts because the
 * overlay needs the opposite contract: it must stay open and show the problem
 * inline, so this *returns* the outcome instead of redirecting with ?error=.
 * Nothing here throws on a foreseeable failure, and the catch-all at the bottom
 * makes sure an unforeseeable one becomes a message rather than an exception
 * that takes the page's render down with it.
 *
 * One action for both modes rather than two: the difference between them is a
 * hidden id and whether a photo is required, and splitting that into two
 * near-identical code paths is how the two got to look different in the first
 * place.
 */

function text(value: FormDataEntryValue | null, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function nullable(
  value: FormDataEntryValue | null,
  maxLength: number
): string | null {
  const trimmed = text(value, maxLength);
  return trimmed === "" ? null : trimmed;
}

function toId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function saveProjectFromOverlay(
  _previous: ProjectSaveState,
  formData: FormData
): Promise<ProjectSaveState> {
  try {
    // Re-checked here, not inherited from the page: a server action is a POST
    // endpoint of its own and can be called without the UI.
    if (!(await isAuthenticated())) {
      return {
        status: "error",
        error: "Your session has expired. Reload the page and sign in again.",
      };
    }

    const id = toId(formData.get("id"));
    const title = text(formData.get("title"), 255);
    const category = toCategoryKey(formData.get("category"));
    const caption = nullable(formData.get("caption"), 500);
    const description = nullable(formData.get("description"), 5000);

    const fieldErrors: Record<string, string> = {};
    if (!title) fieldErrors.title = "A project needs a title.";

    const upload = formData.get("image");
    const hasFile = upload instanceof File && upload.size > 0;

    if (hasFile && upload.size > IMAGE_MAX_MB * 1024 * 1024) {
      // The browser checks this too. Repeated here because the browser's copy
      // is a convenience, not a guarantee — this is the one that counts.
      fieldErrors.image = `That photo is ${(upload.size / 1024 / 1024).toFixed(
        1
      )}MB. Choose one under ${IMAGE_MAX_MB}MB.`;
    } else if (!hasFile && id === null) {
      // Required for new projects only: the public gallery lays out photos, so
      // a new row without one renders as a gap. An edit that leaves the field
      // empty simply keeps the photo it already has.
      fieldErrors.image = "Choose a photo for the new project.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { status: "error", fieldErrors };
    }

    let newImageUrl: string | null = null;
    if (hasFile) {
      const stored = await saveProjectImage(upload as File);
      if (stored.error) {
        return { status: "error", fieldErrors: { image: stored.error } };
      }
      if (!stored.url) {
        return {
          status: "error",
          fieldErrors: {
            image: "The photo could not be stored. Please try again.",
          },
        };
      }
      newImageUrl = stored.url;
    }

    /* ---- create ---- */
    if (id === null) {
      const orderRows = await query<{ next: number | null }>(
        "SELECT MAX(display_order) AS next FROM projects"
      );
      const order = Number(orderRows[0]?.next ?? 0) + 10;

      await execute(
        `INSERT INTO projects
           (title, category, image_filename, caption, description, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, category, newImageUrl, caption, description, order]
      );

      console.log(`[content] Created project "${title}" via overlay`);
      revalidatePath("/admin");
      return { status: "success", savedTitle: title, mode: "created" };
    }

    /* ---- update ---- */
    const existing = await query<ProjectRow>(
      "SELECT * FROM projects WHERE id = ?",
      [id]
    );
    const current = existing[0];
    if (!current) {
      return {
        status: "error",
        error:
          "That project no longer exists — someone may have deleted it. " +
          "Close this panel and refresh the list.",
      };
    }

    await execute(
      `UPDATE projects
          SET title = ?, category = ?, caption = ?, description = ?
              ${newImageUrl ? ", image_filename = ?" : ""}
        WHERE id = ?`,
      newImageUrl
        ? [title, category, caption, description, newImageUrl, id]
        : [title, category, caption, description, id]
    );

    // Only once the row points at the new file, so a failed update never
    // leaves the row referencing something already deleted.
    if (newImageUrl) {
      await deleteProjectImage(current.image_filename);
    }

    console.log(`[content] Updated project ${id} via overlay`);
    revalidatePath("/admin");
    return { status: "success", savedTitle: title, mode: "updated" };
  } catch (error) {
    // The last line of defence. A thrown error here would propagate into
    // rendering and blank the dashboard; the client only ever needs a string.
    console.error("[content] saveProjectFromOverlay failed:", error);
    return {
      status: "error",
      error:
        "Something went wrong saving that project. Nothing was changed — " +
        "please try again, and check any photo is a JPG, PNG or WEBP under " +
        `${IMAGE_MAX_MB}MB.`,
    };
  }
}
