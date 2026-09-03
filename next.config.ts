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
const SECURITY_HEADERS = [
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
