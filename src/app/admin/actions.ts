"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  isAdminConfigured,
  sessionCookie,
  verifyPassword,
} from "@/lib/admin-auth";

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
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}
