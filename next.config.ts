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
 * Security response headers — phase 1 of two.
 *
 * Every value here is a constant string. Nothing is computed per request, no
 * code runs to produce them, and none of them can influence the lifetime of
 * the Node process. That property is the entire reason they ship separately:
 * an earlier commit added these together with a Content-Security-Policy and
 * was reverted during an incident, and isolating the five that cannot
 * plausibly be involved lets the remaining question be answered on its own.
 *
 * Content-Security-Policy is deliberately NOT here. It arrives as phase 2,
 * after this has been observed stable in production for a meaningful period.
 */
/**
 * Content-Security-Policy — phase 2.
 *
 * Built from the audit recorded in DEPLOYMENT.md, which measured every request
 * origin the site actually produces rather than guessing from a template. The
 * three deliberate absences matter as much as what is present:
 *
 * - no `fonts.googleapis.com` / `fonts.gstatic.com`: next/font/google
 *   downloads Inter and Oswald at build time and serves them from
 *   /_next/static/media, so `font-src 'self'` is complete.
 * - no Pexels / Unsplash / R2 hosts in `img-src`: every remote image is
 *   proxied through /_next/image, so the browser only fetches from this
 *   origin. A new image host means editing `images.remotePatterns` below.
 * - no `maps.googleapis.com` in `script-src`: the contact page's embed loads
 *   that inside the iframe, a separate document governed by Google's own
 *   policy. Only `frame-src` is this policy's business.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // 'unsafe-inline' is required, not preferred: Next's App Router streams the
  // RSC payload through inline <script> tags and the JSON-LD block is inline
  // too. They change every build, so hashes are impractical, and a nonce must
  // be generated per request, which would force the currently static marketing
  // pages to render dynamically.
  "script-src 'self' 'unsafe-inline'",
  // Also required rather than preferred: framer-motion animates through inline
  // `style` attributes, dozens of them per page.
  "style-src 'self' 'unsafe-inline'",
  // blob: is not optional — the admin's project upload preview is a
  // createObjectURL of the chosen file. It only appears mid-upload, which is
  // what makes it easy to leave out and not notice.
  "img-src 'self' blob:",
  "font-src 'self'",
  "frame-src https://www.google.com",
];

const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: CSP_DIRECTIVES.join("; "),
  },
  {
    // One year, and includeSubDomains as agreed. This commits every present
    // and future subdomain to HTTPS for that year: a subdomain served over
    // plain HTTP becomes unreachable to anyone who has seen this header.
    //
    // No `preload` — that submits the domain to a list compiled into browsers
    // and is far harder to undo than a header.
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // DENY rather than SAMEORIGIN: no page on this site is meant to be framed.
    // The Google Maps embed on /contact is this site framing Google, which
    // this header does not affect.
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Matters most for the admin résumé download, where a browser guessing a
    // type other than the one declared is exactly the risk.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Full URL to same-origin destinations, origin only cross-origin, so an
    // /admin URL never leaks in a Referer to a third party.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
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
