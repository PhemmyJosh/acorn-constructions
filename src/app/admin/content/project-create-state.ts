/**
 * Shape of the create-project action's result.
 *
 * Deliberately NOT in project-create-action.ts: that file carries the
 * "use server" directive, and such a file may only export async functions.
 * Exporting the initial-state object from there fails at runtime with
 * `A "use server" file can only export async functions, found object` — which
 * surfaces as a crashed tab, not a build error.
 */
export interface CreateProjectState {
  status: "idle" | "success" | "error";
  /** Shown at the top of the overlay form. */
  error?: string;
  /** Keyed by field name, shown beneath that field. */
  fieldErrors?: Record<string, string>;
  /** Title of the project just created, for the success alert. */
  createdTitle?: string;
}

export const createProjectInitialState: CreateProjectState = { status: "idle" };
