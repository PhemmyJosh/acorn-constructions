"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Error boundary for everything under /admin.
 *
 * The specific crash this was written after — a photo over the Server Action
 * body limit — is now prevented in three other places, but the point of a
 * boundary is the failure nobody predicted. Without one, any throw during a
 * render or an action leaves the dashboard as "the site could not load", with
 * no way back except editing the URL. With one, the client at least learns
 * what happened and can retry.
 *
 * Note this catches render and action errors, not the body-size rejection
 * itself: that is refused by the framework while the request body is still
 * being parsed, so no React code runs and no boundary can see it. Keeping the
 * oversized file in the browser is what handles that case.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The message is deliberately not rendered: it can carry internals, and
    // this page is one password away from the public internet.
    console.error("[admin] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg rounded-sm border border-acorn-rust/40 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="mt-0.5 shrink-0 text-acorn-rust">
            <AlertTriangle size={24} />
          </span>
          <div>
            <h1 className="font-heading text-2xl uppercase tracking-wide text-acorn-charcoal">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-acorn-charcoal/75">
              The dashboard hit an unexpected error. Nothing you were part-way
              through has been saved. Try again — if it keeps happening, send
              your developer the time it occurred
              {error.digest ? (
                <>
                  {" "}
                  and this reference:{" "}
                  <code className="rounded-sm bg-acorn-stone px-1.5 py-0.5 text-xs">
                    {error.digest}
                  </code>
                </>
              ) : null}
              .
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-sm bg-acorn-gold px-5 py-2.5 font-heading text-xs uppercase tracking-[0.15em] text-acorn-charcoal transition-colors hover:brightness-95"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Try again
          </button>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 rounded-sm border border-acorn-bronze/40 px-5 py-2.5 font-heading text-xs uppercase tracking-[0.15em] text-acorn-charcoal transition-colors hover:bg-acorn-stone"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
