"use server";

import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/admin-auth";
import { execute, query } from "@/lib/db";
import { toCategoryKey } from "@/lib/content-data";
import { saveProjectImage } from "@/lib/content-upload";
import { IMAGE_MAX_MB } from "@/lib/content-constants";
// Type-only import: erased at compile time, so it adds no non-function export
// to this "use server" module.
import type { CreateProjectState } from "./project-create-state";

/**
 * Create-project action for the overlay form.
 *
 * Separate from the redirect-driven actions in content-actions.ts because the
 * overlay needs the opposite contract: it must stay open and show the problem
 * inline, so this *returns* the outcome instead of redirecting with ?error=.
 * Nothing here throws on a foreseeable failure, and the catch-all at the bottom
 * makes sure an unforeseeable one becomes a message rather than an exception
 * that takes the page's render down with it.
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

export async function createProject(
  _previous: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  try {
    // Re-checked here, not inherited from the page: a server action is a POST
    // endpoint of its own and can be called without the UI.
    if (!(await isAuthenticated())) {
      return {
        status: "error",
        error: "Your session has expired. Reload the page and sign in again.",
      };
    }

    const title = text(formData.get("title"), 255);
    const category = toCategoryKey(formData.get("category"));
    const caption = nullable(formData.get("caption"), 500);
    const description = nullable(formData.get("description"), 5000);

    const fieldErrors: Record<string, string> = {};
    if (!title) fieldErrors.title = "A project needs a title.";

    const upload = formData.get("image");
    const hasFile = upload instanceof File && upload.size > 0;
    if (!hasFile) {
      // Required for new projects specifically: the public gallery lays out
      // photos, so a row without one renders as a gap.
      fieldErrors.image = "Choose a photo for the new project.";
    } else if (upload.size > IMAGE_MAX_MB * 1024 * 1024) {
      // The browser checks this too. Repeated here because the browser's copy
      // is a convenience, not a guarantee — this is the one that counts.
      fieldErrors.image = `That photo is ${(upload.size / 1024 / 1024).toFixed(
        1
      )}MB. Choose one under ${IMAGE_MAX_MB}MB.`;
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { status: "error", fieldErrors };
    }

    const stored = await saveProjectImage(upload as File);
    if (stored.error) {
      return { status: "error", fieldErrors: { image: stored.error } };
    }
    if (!stored.url) {
      return {
        status: "error",
        fieldErrors: { image: "The photo could not be stored. Please try again." },
      };
    }

    const orderRows = await query<{ next: number | null }>(
      "SELECT MAX(display_order) AS next FROM projects"
    );
    const order = Number(orderRows[0]?.next ?? 0) + 10;

    await execute(
      `INSERT INTO projects
         (title, category, image_filename, caption, description, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, category, stored.url, caption, description, order]
    );

    console.log(`[content] Created project "${title}" via overlay`);

    // Refreshes the RSC payload for /admin, so the new row shows up in the
    // table without a full page load.
    revalidatePath("/admin");

    return { status: "success", createdTitle: title };
  } catch (error) {
    // The last line of defence. A thrown error here would propagate into
    // rendering and blank the dashboard; the client only ever needs a string.
    console.error("[content] createProject failed:", error);
    return {
      status: "error",
      error:
        "Something went wrong creating that project. Nothing was saved — " +
        "please try again, and check the photo is a JPG, PNG or WEBP under " +
        `${IMAGE_MAX_MB}MB.`,
    };
  }
}
