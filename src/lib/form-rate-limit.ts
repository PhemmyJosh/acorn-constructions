import { NextResponse } from "next/server";
import { clientIp } from "@/lib/client-ip";
import { FORM_RULE, consumeRateLimit, retryAfterPhrase } from "@/lib/rate-limit";

/**
 * Per-IP submission limit shared by the three public form routes, so all of
 * them refuse a flood the same way.
 *
 * Buckets are per route rather than one pooled budget across all three. A
 * pooled budget would mean someone who legitimately sends a message, asks for
 * an estimate and applies for a job in the same hour is most of the way to
 * being locked out, while the flood protection is the same either way: a bot
 * hammering one endpoint still stops at five.
 *
 * Call this at the very top of the handler, before parsing the body — a
 * malformed-body flood should be cheap to refuse too. Every request that
 * reaches it costs budget, including ones that later fail validation, which is
 * what makes the count mean "submission attempts" rather than "stored rows".
 *
 * @returns a 429 response to return immediately, or null when the request may
 *          proceed.
 */
export function formRateLimitResponse(
  request: Request,
  route: string
): NextResponse | null {
  const ip = clientIp(request.headers);
  const decision = consumeRateLimit(`form:${route}:${ip}`, FORM_RULE);
  if (decision.allowed) return null;

  console.warn(
    `[rate-limit] Refused ${route} for ${ip}: over ${FORM_RULE.limit} ` +
      `submissions per hour. Retry in ${decision.retryAfterSeconds}s.`
  );

  return NextResponse.json(
    {
      // FormError renders the phone and email fallback beneath whatever message
      // it is given, so this deliberately does not repeat them.
      error:
        "You've submitted several requests recently. Please wait " +
        `${retryAfterPhrase(decision.retryAfterSeconds)} before sending another.`,
    },
    {
      status: 429,
      // Correct HTTP semantics for a throttled request, and what a well-behaved
      // client or crawler reads to back off on its own.
      headers: { "Retry-After": String(decision.retryAfterSeconds) },
    }
  );
}
