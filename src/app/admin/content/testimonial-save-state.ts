/**
 * Shape of the testimonial save action's result, shared by create and edit.
 *
 * Deliberately NOT in testimonial-save-action.ts: that file carries the
 * "use server" directive, and such a file may only export async functions.
 * Exporting an object from there fails at runtime with
 * `A "use server" file can only export async functions, found object` — which
 * surfaces as a crashed tab, not a build error.
 */
export interface TestimonialSaveState {
  status: "idle" | "success" | "error";
  /** Shown at the top of the overlay form. */
  error?: string;
  /** Keyed by field name, shown beneath that field. */
  fieldErrors?: Record<string, string>;
  /** Client name of the testimonial just saved, for the confirmation. */
  savedName?: string;
  /** Which wording the confirmation should use. */
  mode?: "created" | "updated";
}

export const testimonialSaveInitialState: TestimonialSaveState = {
  status: "idle",
};
