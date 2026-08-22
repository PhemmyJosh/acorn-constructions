/**
 * Client-side helpers shared by the three site forms.
 *
 * Each returns a plain result rather than throwing, so components can render a
 * single readable error string without duplicating fetch/parse logic.
 */

export interface SubmitResult {
  ok: boolean;
  error?: string;
}

const GENERIC_ERROR =
  "Something went wrong sending that. Please try again, or call us directly.";

interface ApiErrorBody {
  error?: unknown;
  errors?: unknown;
}

/** Turns the API's `{error}` or `{errors: {field: message}}` into one string. */
function readError(body: ApiErrorBody | null): string {
  if (!body) return GENERIC_ERROR;

  if (typeof body.error === "string" && body.error) return body.error;

  if (body.errors && typeof body.errors === "object") {
    const messages = Object.values(body.errors as Record<string, unknown>).filter(
      (value): value is string => typeof value === "string" && value.length > 0
    );
    if (messages.length > 0) return messages.join(" ");
  }

  return GENERIC_ERROR;
}

async function handle(response: Response): Promise<SubmitResult> {
  if (response.ok) return { ok: true };

  let body: ApiErrorBody | null = null;
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // Non-JSON response (e.g. a proxy error page); fall back to the generic
    // message below.
  }
  return { ok: false, error: readError(body) };
}

export async function postJson(
  url: string,
  payload: unknown
): Promise<SubmitResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handle(response);
  } catch {
    return {
      ok: false,
      error: "Could not reach the server. Check your connection and try again.",
    };
  }
}

export async function postFormData(
  url: string,
  data: FormData
): Promise<SubmitResult> {
  try {
    // No Content-Type header: the browser must set the multipart boundary.
    const response = await fetch(url, { method: "POST", body: data });
    return handle(response);
  } catch {
    return {
      ok: false,
      error: "Could not reach the server. Check your connection and try again.",
    };
  }
}
