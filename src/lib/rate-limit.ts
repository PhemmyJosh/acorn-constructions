/**
 * In-memory sliding-window rate limiter.
 *
 * Deliberately not Redis: the app runs as a single long-lived Node process on
 * one Hostinger instance, so process memory is a perfectly good store at this
 * traffic scale. The tradeoff, worth knowing rather than hiding: counters reset
 * on restart and on deploy, so a redeploy hands an attacker a fresh budget. For
 * slowing down password guessing and spam floods that is an acceptable price
 * for having no external dependency to provision, pay for, or fail.
 *
 * Server-only — never import from a "use client" file.
 */

export interface RateLimitRule {
  /** Requests permitted inside one window. */
  limit: number;
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  /** Seconds until a slot frees up. Zero when allowed. */
  retryAfterSeconds: number;
}

/** Admin login: 5 failed attempts per 15 minutes. Successes do not count. */
export const LOGIN_RULE: RateLimitRule = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
};

/** Each public form: 5 submissions per hour. */
export const FORM_RULE: RateLimitRule = {
  limit: 5,
  windowMs: 60 * 60 * 1000,
};

/**
 * key -> hit timestamps inside the current window, oldest first.
 *
 * On globalThis so the dev server's module reloading does not silently reset
 * the limits mid-session.
 */
const globalForRateLimit = globalThis as unknown as {
  acornRateLimitHits?: Map<string, number[]>;
  acornRateLimitSweptAt?: number;
};

const hits = (globalForRateLimit.acornRateLimitHits ??= new Map<string, number[]>());

/** Longest window any rule uses, so the sweep never drops a live entry. */
const MAX_WINDOW_MS = Math.max(LOGIN_RULE.windowMs, FORM_RULE.windowMs);
const SWEEP_INTERVAL_MS = 60 * 1000;

/**
 * Hard ceiling on tracked keys. Entries expire on their own, so this only bites
 * under a distributed flood of unique IPs — where unbounded growth would be a
 * memory-exhaustion vector in its own right. Oldest-seen keys are dropped
 * first, which is the least-bad option: they are the closest to expiring
 * anyway.
 */
const MAX_KEYS = 20_000;

/**
 * Drops expired entries. Called opportunistically rather than on a timer: a
 * setInterval would keep a handle alive for the life of the process and fire
 * even when nothing is being rate limited.
 */
function sweep(now: number): void {
  if (now - (globalForRateLimit.acornRateLimitSweptAt ?? 0) < SWEEP_INTERVAL_MS) {
    return;
  }
  globalForRateLimit.acornRateLimitSweptAt = now;

  for (const [key, timestamps] of hits) {
    const live = timestamps.filter((at) => now - at < MAX_WINDOW_MS);
    if (live.length === 0) hits.delete(key);
    else if (live.length !== timestamps.length) hits.set(key, live);
  }

  if (hits.size <= MAX_KEYS) return;

  // Sort by most recent hit, keep the freshest MAX_KEYS.
  const byRecency = [...hits.entries()].sort(
    (a, b) => (b[1][b[1].length - 1] ?? 0) - (a[1][a[1].length - 1] ?? 0)
  );
  for (const [key] of byRecency.slice(MAX_KEYS)) hits.delete(key);
  console.warn(
    `[rate-limit] Tracked keys exceeded ${MAX_KEYS}; dropped the oldest. ` +
      "This normally means a distributed flood is in progress."
  );
}

/** Timestamps for `key` that are still inside `rule`'s window. */
function liveHits(key: string, rule: RateLimitRule, now: number): number[] {
  const timestamps = hits.get(key);
  if (!timestamps) return [];
  return timestamps.filter((at) => now - at < rule.windowMs);
}

function decide(live: number[], rule: RateLimitRule, now: number): RateLimitDecision {
  if (live.length < rule.limit) return { allowed: true, retryAfterSeconds: 0 };
  // A slot frees up when the oldest hit in the window ages out.
  const oldest = live[0];
  const remainingMs = Math.max(0, oldest + rule.windowMs - now);
  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil(remainingMs / 1000)),
  };
}

/**
 * Reports whether `key` is currently over its limit WITHOUT recording a hit.
 *
 * Used by the login, where only a failed attempt should cost budget — checking
 * and charging separately is what stops a correct password from being spent on
 * a request that was going to be refused anyway.
 */
export function checkRateLimit(key: string, rule: RateLimitRule): RateLimitDecision {
  const now = Date.now();
  sweep(now);
  return decide(liveHits(key, rule, now), rule, now);
}

/** Records a hit against `key`. Call only when the attempt should cost budget. */
export function recordRateLimitHit(key: string, rule: RateLimitRule): void {
  const now = Date.now();
  hits.set(key, [...liveHits(key, rule, now), now]);
}

/**
 * Records a hit and reports whether that hit was permitted — the single-call
 * form used by the public form routes, where every request costs budget.
 */
export function consumeRateLimit(
  key: string,
  rule: RateLimitRule
): RateLimitDecision {
  const now = Date.now();
  sweep(now);
  const live = liveHits(key, rule, now);
  const decision = decide(live, rule, now);
  // Recorded even when refused, so hammering the endpoint keeps the window
  // sliding forward rather than letting a caller retry for free.
  hits.set(key, [...live, now]);
  return decision;
}

/** Forgets `key` entirely. Used to clear failed attempts after a real login. */
export function clearRateLimit(key: string): void {
  hits.delete(key);
}

/**
 * "12 minutes" / "1 minute" / "a moment", for use inside a sentence.
 *
 * Rounded up, so the message never tells someone to come back before the block
 * has actually lifted.
 */
export function retryAfterPhrase(seconds: number): string {
  if (seconds <= 45) return "a moment";
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}
