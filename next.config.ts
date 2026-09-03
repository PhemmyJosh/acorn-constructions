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

const nextConfig: NextConfig = {
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
