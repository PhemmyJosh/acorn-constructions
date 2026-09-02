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
