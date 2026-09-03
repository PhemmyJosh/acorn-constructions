import type { NextConfig } from "next";

/**
 * Client-uploaded project photos live in Cloudflare R2 and are served from the
 * bucket's public URL, which differs per environment. Deriving the pattern
 * from R2_PUBLIC_URL keeps the hostname out of the repo and means a bucket
 * change needs no code edit.
 *
 * Read at build time, so R2_PUBLIC_URL must be present in the build
 * environment as well as at runtime.
 */
function r2RemotePattern() {
  const publicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (!publicUrl) return [];

  try {
    const { protocol, hostname } = new URL(publicUrl);
    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
      },
    ];
  } catch {
    console.warn(
      `[next.config] R2_PUBLIC_URL is not a valid URL: ${publicUrl}. ` +
        "Uploaded project photos will not pass next/image."
    );
    return [];
  }
}

/**
 * Content-Security-Policy, written against what the site was measured to load
 * rather than what a template suggests. Each directive and why it is what it is:
 *
 * - `default-src 'self'`      everything not named below is same-origin only.
 * - `script-src` needs `'unsafe-inline'`. Next's App Router streams the RSC
 *   payload through inline <script> tags — 28 of the 42 scripts on the home
 *   page are inline, carrying `self.__next_f.push(...)` — and the JSON-LD block
 *   is inline too. They change every build, so hashing is impractical, and a
 *   nonce has to be generated per request, which would force the six currently
 *   static pages to render dynamically. See the note below on what this costs.
 * - `style-src` needs `'unsafe-inline'` for style *attributes*: framer-motion
 *   animates via inline `style`, 61 elements on the home page. Tailwind itself
 *   compiles to one same-origin stylesheet, and there are no <style> tags.
 * - `img-src` adds `data:` (next/image placeholders) and `blob:` (the admin's
 *   upload preview, which is a createObjectURL of the chosen file). Pexels,
 *   Unsplash and the R2 bucket are deliberately absent: every remote image is
 *   proxied through /_next/image, so the browser only ever fetches it from this
 *   origin. Adding an image host means editing `images.remotePatterns` below —
 *   not this policy.
 * - `font-src 'self'` only. next/font/google downloads Inter and Oswald at
 *   build time and serves them from /_next/static/media, so nothing is fetched
 *   from fonts.googleapis.com or fonts.gstatic.com at runtime. Verified by
 *   reading the @font-face URLs out of the live stylesheet.
 * - `frame-src https://www.google.com` for the keyless Maps embed on the
 *   contact page. The scripts and tiles that embed then loads from
 *   maps.googleapis.com and maps.gstatic.com are governed by the iframe's own
 *   document, not this policy, so they are correctly not listed here.
 * - `connect-src 'self'` covers RSC navigation fetches and server actions.
 * - `form-action 'self'` stops an injected form posting the contact, estimate
 *   or careers data to somebody else's server.
 * - `frame-ancestors 'none'` is the modern equivalent of X-Frame-Options and
 *   the one browsers actually honour; the header is kept for older ones.
 * - `object-src 'none'`, `base-uri 'self'` close off plugin embedding and
 *   <base> injection, neither of which this site uses.
 *
 * Honest limitation: with `'unsafe-inline'` on script-src, this policy is a
 * strong control on *where code and content may come from* and a weak one
 * against inline injection. Tightening that means nonces via middleware, and
 * the tradeoff is losing static rendering on the marketing pages.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "frame-src https://www.google.com",
];

const SECURITY_HEADERS = [
  {
    // One year, and includeSubDomains as requested. Note this commits every
    // present and future subdomain to HTTPS for that year: a subdomain served
    // over plain HTTP becomes unreachable for visitors who have seen this
    // header. No `preload` — that submits the domain to a browser-baked list
    // and is far harder to undo than a header.
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // Superseded by frame-ancestors above, kept for browsers that predate it.
    // DENY rather than SAMEORIGIN: nothing on this site embeds its own pages.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Matters most for the admin résumé download, where a browser guessing a
    // type other than the declared one is exactly the risk.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Sends the full URL to same-origin destinations and only the origin
    // cross-origin, so an /admin URL never leaks in a Referer to a third party.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value: CSP_DIRECTIVES.join("; "),
  },
];

const nextConfig: NextConfig = {
  // Removes `X-Powered-By: Next.js`, which tells an attacker what to target
  // and tells a visitor nothing.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },

  experimental: {
    serverActions: {
      /**
       * Server Actions cap their request body at 1MB by default, a limit
       * entirely separate from our own IMAGE_MAX_MB validation. A 2MB photo
       * therefore passed every check we wrote and was then rejected by the
       * framework while the body was still being parsed — before any of our
       * code ran, which is why it surfaced as a page crash rather than a form
       * error, and why no try/catch inside the action could ever have caught
       * it.
       *
       * 6mb, not 5mb: the limit applies to the raw HTTP body, so multipart
       * boundaries, part headers and the other form fields all count on top of
       * the file's own bytes. The headroom means anything our 5MB validation
       * accepts is comfortably inside the framework's limit, leaving our
       * message — not Next's error page — as the thing a client sees.
       *
       * Still `experimental` in Next 16.2; there is no stable equivalent yet.
       */
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...r2RemotePattern(),
    ],
  },
};

export default nextConfig;
