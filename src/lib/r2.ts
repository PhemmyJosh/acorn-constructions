import { S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 client for client-uploaded project photos.
 *
 * R2 speaks the S3 API, so the AWS SDK talks to it directly. Photos live here
 * rather than on the server's disk because Hostinger builds each deploy into a
 * fresh directory from a Git checkout: anything written to disk at runtime is
 * gone at the next deploy. Object storage is outside that lifecycle.
 *
 * Server-only. Never import this from a "use client" file — it pulls in the
 * AWS SDK and reads secrets from the environment.
 */

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Bucket's public base URL, without a trailing slash. */
  publicUrl: string;
}

/**
 * Reads the five R2 variables, or returns null when any is missing.
 *
 * Deliberately all-or-nothing: a half-configured bucket should fail the upload
 * with a clear message rather than silently falling back to local disk, which
 * is exactly the failure mode this migration exists to remove.
 */
export function r2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  // Shared with r2PublicUrl so the trailing-slash normalisation cannot drift.
  const publicUrl = r2PublicUrl();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return null;
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

/**
 * The public base URL on its own, without requiring credentials.
 *
 * Recognising our own images must not depend on the secret key being present:
 * if it were, a partially-configured environment would stop identifying stored
 * photos as ours and would quietly skip deleting them from the bucket, leaving
 * orphaned objects behind. Credentials are needed to *act* on an object, not
 * to recognise one.
 */
export function r2PublicUrl(): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL?.trim().replace(/\/+$/, "");
  return publicUrl || null;
}

/** True when a stored image value points at our own R2 bucket. */
export function isR2Url(value: string | null): boolean {
  const publicUrl = r2PublicUrl();
  if (!value || !publicUrl) return false;
  return value.startsWith(`${publicUrl}/`);
}

/** The object key behind a stored R2 URL, or null if it is not one of ours. */
export function r2KeyFromUrl(value: string | null): string | null {
  const publicUrl = r2PublicUrl();
  if (!value || !publicUrl) return null;
  const prefix = `${publicUrl}/`;
  if (!value.startsWith(prefix)) return null;
  const key = value.slice(prefix.length);
  return key.length > 0 ? key : null;
}

/**
 * Cached on globalThis so the dev server's module reloading does not leak a
 * new client (and a new connection pool) on every edit.
 */
const globalForR2 = globalThis as unknown as { acornR2Client?: S3Client };

export function r2Client(config: R2Config): S3Client {
  if (!globalForR2.acornR2Client) {
    globalForR2.acornR2Client = new S3Client({
      // R2 ignores the region but the SDK requires one.
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return globalForR2.acornR2Client;
}
