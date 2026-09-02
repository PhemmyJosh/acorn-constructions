"use server";

import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/admin-auth";
import { execute, query } from "@/lib/db";
import type { TestimonialRow } from "@/lib/content-data";
// Type-only import: erased at compile time, so it adds no non-function export
// to this "use server" module.
import type { TestimonialSaveState } from "./testimonial-save-state";

/**
 * Create-or-update for the testimonial overlay.
 *
 * Same contract as saveProjectFromOverlay: it *returns* the outcome rather
 * than redirecting with ?error=, so the overlay can stay open and show the
 * problem next to the field that caused it. Nothing here throws on a
 * foreseeable failure, and the catch-all at the bottom makes sure an
 * unforeseeable one becomes a message rather than an exception that takes the
 * page's render down with it.
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

export async function saveTestimonialFromOverlay(
  _previous: TestimonialSaveState,
  formData: FormData
): Promise<TestimonialSaveState> {
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
    const name = text(formData.get("client_name"), 255);
    const role = nullable(formData.get("client_role"), 255);
    const location = nullable(formData.get("client_location"), 255);
    const quote = text(formData.get("quote"), 5000);
    // An unchecked checkbox sends nothing at all, so absence means unpublished.
    const isPublished = formData.get("is_published") === "on" ? 1 : 0;

    const fieldErrors: Record<string, string> = {};
    if (!name) fieldErrors.client_name = "A testimonial needs a client name.";
    if (!quote) fieldErrors.quote = "A testimonial needs a quote.";

    if (Object.keys(fieldErrors).length > 0) {
      return { status: "error", fieldErrors };
    }

    /* ---- create ---- */
    if (id === null) {
      const orderRows = await query<{ next: number | null }>(
        "SELECT MAX(display_order) AS next FROM testimonials"
      );
      const order = Number(orderRows[0]?.next ?? 0) + 10;

      await execute(
        `INSERT INTO testimonials
           (client_name, client_role, client_location, quote, is_published, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, role, location, quote, isPublished, order]
      );

      console.log(`[content] Created testimonial for ${name} via overlay`);
      revalidatePath("/admin");
      return { status: "success", savedName: name, mode: "created" };
    }

    /* ---- update ---- */
    const existing = await query<TestimonialRow>(
      "SELECT id FROM testimonials WHERE id = ?",
      [id]
    );
    if (!existing[0]) {
      return {
        status: "error",
        error:
          "That testimonial no longer exists — someone may have deleted it. " +
          "Close this panel and refresh the list.",
      };
    }

    await execute(
      `UPDATE testimonials
          SET client_name = ?, client_role = ?, client_location = ?,
              quote = ?, is_published = ?
        WHERE id = ?`,
      [name, role, location, quote, isPublished, id]
    );

    console.log(`[content] Updated testimonial ${id} via overlay`);
    revalidatePath("/admin");
    return { status: "success", savedName: name, mode: "updated" };
  } catch (error) {
    // The last line of defence. A thrown error here would propagate into
    // rendering and blank the dashboard; the client only ever needs a string.
    console.error("[content] saveTestimonialFromOverlay failed:", error);
    return {
      status: "error",
      error:
        "Something went wrong saving that testimonial. Nothing was changed — " +
        "please try again.",
    };
  }
}
