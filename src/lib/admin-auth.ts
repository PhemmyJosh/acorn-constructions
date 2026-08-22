import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Cookie-based admin session.
 *
 * The password itself is never stored in the cookie or sent to the browser.
 * Instead we store an HMAC of a fixed marker keyed by the current password and
 * a server-side secret, so the cookie is unforgeable and is invalidated
 * automatically if ADMIN_PASSWORD is ever changed.
 */
export const ADMIN_COOKIE = "acorn_admin";

const SESSION_MARKER = "acorn-admin-session-v1";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function configuredPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function sessionSecret(): string {
  // Falls back to the password so the dashboard still works with only
  // ADMIN_PASSWORD set; ADMIN_SESSION_SECRET is preferred in production.
  return process.env.ADMIN_SESSION_SECRET ?? configuredPassword();
}

function expectedToken(): string {
  return createHmac("sha256", sessionSecret())
    .update(`${SESSION_MARKER}:${configuredPassword()}`)
    .digest("hex");
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/** True when ADMIN_PASSWORD is configured at all. */
export function isAdminConfigured(): boolean {
  return configuredPassword().length > 0;
}

/** Checks a submitted password without leaking timing information. */
export function verifyPassword(submitted: string): boolean {
  const password = configuredPassword();
  if (!password) return false;
  return constantTimeEquals(submitted, password);
}

/** Reads the session cookie and reports whether it is currently valid. */
export async function isAuthenticated(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return constantTimeEquals(token, expectedToken());
}

/** Cookie options shared by the login and logout routes. */
export function sessionCookie(): {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    sameSite: "lax";
    secure: boolean;
    path: string;
    maxAge: number;
  };
} {
  return {
    name: ADMIN_COOKIE,
    value: expectedToken(),
    options: {
      httpOnly: true,
      sameSite: "lax",
      // Local development runs over http, so only require HTTPS in production.
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  };
}
