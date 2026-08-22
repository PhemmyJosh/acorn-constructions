/**
 * Honeypot spam protection shared by the three public form routes.
 *
 * The form renders a field that is positioned off-screen rather than hidden
 * with `display: none`, because a good number of bots skip display:none inputs
 * specifically to dodge this trick. Real users never see it and cannot tab into
 * it, so any value at all means the submission was almost certainly automated.
 */

/** Field name used by both the client component and the API routes. */
export const HONEYPOT_FIELD = "website";

export function isHoneypotFilled(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Server-side visibility only. Counts are kept on globalThis so the dev
 * server's module reloading does not reset them, and are never returned to the
 * client — a bot must not be able to tell that it was caught.
 */
const globalForSpam = globalThis as unknown as {
  acornHoneypotHits?: Record<string, number>;
};

export function noteHoneypotHit(route: string): void {
  globalForSpam.acornHoneypotHits ??= {};
  const total = (globalForSpam.acornHoneypotHits[route] ?? 0) + 1;
  globalForSpam.acornHoneypotHits[route] = total;
  console.warn(
    `[spam] Honeypot triggered on ${route}; discarded without saving. ` +
      `Hits since restart: ${total}`
  );
}
