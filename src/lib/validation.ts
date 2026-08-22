/** Shared validation helpers for the form API routes. */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors = Record<string, string>;

/** Trims a value and caps its length so oversized input cannot bloat a row. */
export function text(value: unknown, maxLength = 1000): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

/** Empty strings become null so optional columns stay NULL rather than ''. */
export function nullableText(value: unknown, maxLength = 1000): string | null {
  const trimmed = text(value, maxLength);
  return trimmed === "" ? null : trimmed;
}

/** Accepts 'YYYY-MM-DD' only; anything else becomes null. */
export function nullableDate(value: unknown): string | null {
  const trimmed = text(value, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const parsed = new Date(`${trimmed}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : trimmed;
}

/** Non-negative integers only; anything else becomes null. */
export function nullableInt(value: unknown): number | null {
  const trimmed = text(value, 20).replace(/[,\s]/g, "");
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.floor(parsed);
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value) && value.length <= 254;
}

/**
 * Validates the fields every form shares. Callers add their own checks and
 * merge the results.
 */
export function validateCommon(fields: {
  name: string;
  email: string;
  phone?: string;
  requirePhone?: boolean;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name) errors.name = "Name is required.";
  if (!fields.email) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(fields.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (fields.requirePhone && !fields.phone) {
    errors.phone = "Phone number is required.";
  }

  return errors;
}
