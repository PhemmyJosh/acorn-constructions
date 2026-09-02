/**
 * Resolves the real client IP from a request's forwarding headers.
 *
 * The app runs behind Hostinger's proxy, so the socket address every request
 * appears to come from is the proxy's, not the visitor's. Keying a rate limit
 * on that would either never trigger or block every visitor at once, so the
 * forwarded headers have to be read instead.
 *
 * The catch is that `X-Forwarded-For` is attacker-controlled at the left-hand
 * end: a client can send its own header and the proxy simply appends to it. So
 * a request that arrives as
 *
 *     X-Forwarded-For: 9.9.9.9, 203.0.113.7
 *                      ^ forged by the client
 *                                 ^ appended by our proxy — the socket address
 *                                   it actually saw, which cannot be forged
 *
 * must be read from the RIGHT. Taking the leftmost entry, which is the common
 * shortcut, would let anyone bypass the limit by rotating a fake header.
 *
 * Each additional trusted hop moves the real client one place further left,
 * hence TRUSTED_PROXY_COUNT.
 */

/**
 * How many proxies sit between the internet and this app. One is correct for a
 * standard Hostinger Node app. Raise it only if you knowingly add another hop
 * (e.g. Cloudflare in front of Hostinger); every increment moves the trusted
 * position one entry left, and setting it higher than the real number of hops
 * lets a client forge its IP.
 */
function trustedProxyCount(): number {
  const raw = Number(process.env.TRUSTED_PROXY_COUNT);
  if (!Number.isInteger(raw) || raw < 1) return 1;
  // A ceiling so a typo cannot walk the index off the trusted end entirely.
  return Math.min(raw, 10);
}

/** Warn once per process rather than on every request. */
const globalForIp = globalThis as unknown as { acornWarnedNoForwardedIp?: boolean };

function warnMissingHeaderOnce(): void {
  if (globalForIp.acornWarnedNoForwardedIp) return;
  globalForIp.acornWarnedNoForwardedIp = true;
  console.warn(
    "[client-ip] No X-Forwarded-For or X-Real-IP header on an incoming request. " +
      "Behind a proxy this means the real client IP is not reaching the app, so " +
      "every visitor shares one rate-limit bucket. Check the reverse proxy's " +
      "forwarding configuration. (Expected when testing directly against localhost.)"
  );
}

/**
 * Normalises the forms an IP can arrive in so the same client cannot occupy two
 * buckets: IPv4-mapped IPv6 (`::ffff:1.2.3.4`), bracketed IPv6, and a
 * `host:port` pair from proxies that include the source port.
 */
function normalise(value: string): string {
  let ip = value.trim().toLowerCase();
  if (ip.startsWith("[")) {
    // [2001:db8::1]:443 -> 2001:db8::1
    const close = ip.indexOf("]");
    if (close > 0) return ip.slice(1, close);
  }
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  // Only strip a port from IPv4; a bare IPv6 address is full of colons.
  const colons = ip.split(":").length - 1;
  if (colons === 1) ip = ip.slice(0, ip.indexOf(":"));
  return ip;
}

/**
 * The client IP to key a rate limit on, or "unknown" when no forwarding header
 * is present.
 *
 * "unknown" is deliberately still a usable key: the limiter treats it as one
 * shared bucket rather than skipping the limit. Failing open there would leave
 * the login brute-forceable whenever the proxy is misconfigured, which is the
 * worse of the two failures — and the warning above makes the cause findable.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (hops.length > 0) {
      // Rightmost is the nearest proxy's observation; step left one entry per
      // extra trusted hop. Clamped so a too-high count cannot go negative.
      const index = Math.max(0, hops.length - trustedProxyCount());
      return normalise(hops[index]);
    }
  }

  // Some proxies send only this. It carries a single value already resolved to
  // the client, so there is no chain to walk.
  const real = headers.get("x-real-ip");
  if (real?.trim()) return normalise(real);

  warnMissingHeaderOnce();
  return "unknown";
}
