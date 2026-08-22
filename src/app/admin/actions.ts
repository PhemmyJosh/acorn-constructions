"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  isAdminConfigured,
  isAuthenticated,
  sessionCookie,
  verifyPassword,
} from "@/lib/admin-auth";
import { execute } from "@/lib/db";
import { TABLE_NAMES, toTab } from "@/lib/admin-data";

export type LoginState = { error?: string };

export async function login(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return { error: "ADMIN_PASSWORD is not set on the server." };
  }

  const submitted = formData.get("password");
  if (typeof submitted !== "string" || !verifyPassword(submitted)) {
    return { error: "Incorrect password." };
  }

  const { name, value, options } = sessionCookie();
  (await cookies()).set(name, value, options);

  // Someone arriving from an emailed "View in Dashboard" link lands on the
  // login form first; send them on to the entry they clicked rather than the
  // bare table.
  redirect(safeNext(formData.get("next")));
}

/**
 * Only ever returns an admin path on this site. A redirect target that came
 * from a form field must not be able to point at another host, so anything
 * that is not a relative /admin path is discarded.
 */
function safeNext(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/admin";
  // Rejects "//evil.example" and "/admin@evil" as well as absolute URLs.
  if (!/^\/admin(\?[^\s]*)?$/.test(value)) return "/admin";
  return value;
}

export async function logout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}

/**
 * Every action below mutates data, so each one re-checks the session itself.
 * A server action is a POST endpoint like any other: it must not rely on the
 * page having rendered the authenticated view.
 */
async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Not authorized.");
  }
}

/** Numeric row id, or null if the form value was not a positive integer. */
function toId(value: FormDataEntryValue | null): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Returns a submission to unread so it can be revisited later. Closes the
 * detail view afterwards, so the restored unread badge is visible.
 */
export async function markUnread(formData: FormData): Promise<void> {
  await requireAdmin();

  const tab = toTab(formData.get("tab"));
  const id = toId(formData.get("id"));
  if (id === null) redirect(`/admin?tab=${tab}`);

  await execute(
    `UPDATE ${TABLE_NAMES[tab]} SET is_read = 0, read_at = NULL WHERE id = ?`,
    [id]
  );
  console.log(`[admin] Marked ${TABLE_NAMES[tab]} row ${id} unread`);

  redirect(`/admin?${listParams(tab, formData)}`);
}

/**
 * Rebuilds the table-view query string, deliberately dropping any `id` so the
 * detail view closes rather than reopening on the row just acted on.
 */
function listParams(tab: string, formData: FormData): string {
  const params = new URLSearchParams({ tab });
  for (const key of ["read", "sort", "dir"]) {
    const value = formData.get(key);
    if (typeof value === "string" && value) params.set(key, value);
  }
  return params.toString();
}

/**
 * Permanently deletes one submission. For careers rows this also destroys the
 * stored resume, which is the only copy — the confirmation dialog says so.
 */
export async function deleteSubmission(formData: FormData): Promise<void> {
  await requireAdmin();

  const tab = toTab(formData.get("tab"));
  const id = toId(formData.get("id"));
  if (id === null) redirect(`/admin?tab=${tab}`);

  const affected = await execute(
    `DELETE FROM ${TABLE_NAMES[tab]} WHERE id = ?`,
    [id]
  );
  console.log(
    `[admin] Deleted ${TABLE_NAMES[tab]} row ${id} (${affected} row affected)`
  );

  redirect(`/admin?${listParams(tab, formData)}`);
}
