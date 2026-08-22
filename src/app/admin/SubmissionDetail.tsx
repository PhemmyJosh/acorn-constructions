"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, MailOpen, X } from "lucide-react";
import DeleteButton from "./DeleteButton";
import { markUnread } from "./actions";
import {
  DETAIL_FIELDS,
  formatValue,
  type SubmissionRow,
  type TabKey,
} from "@/lib/admin-data";

/**
 * Full-screen view of one submission, with every field laid out and labelled
 * rather than truncated into a table cell.
 *
 * Full-screen rather than a slide-over because the estimate form has fifteen
 * fields, several of them free text — a narrow panel would reintroduce exactly
 * the cramping this view exists to fix.
 *
 * The row is marked read on the server while this page renders; this component
 * only displays the result.
 */
export default function SubmissionDetail({
  tab,
  row,
  closeHref,
  listParams,
}: {
  tab: TabKey;
  row: SubmissionRow;
  closeHref: string;
  listParams: Record<string, string>;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Ignored while a confirmation dialog is open — that dialog handles
      // Escape itself, and closing both at once would lose the user's place.
      if (event.key !== "Escape") return;
      if (document.querySelector('[role="dialog"]')) return;
      router.push(closeHref);
    }

    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [router, closeHref]);

  const fields = DETAIL_FIELDS[tab];
  const name = String(row.name ?? "this submission");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-acorn-cream">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-acorn-bronze/25 pb-5">
          <div>
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-acorn-bronze">
              {tab === "contact"
                ? "Contact submission"
                : tab === "estimate"
                  ? "Estimate request"
                  : "Career application"}
              {" · #"}
              {row.id}
            </p>
            <h1 className="mt-1 font-heading text-2xl uppercase tracking-wide text-acorn-charcoal sm:text-3xl">
              {name}
            </h1>
          </div>

          <button
            type="button"
            aria-label="Close detail view"
            onClick={() => router.push(closeHref)}
            className="rounded-sm border border-acorn-bronze/40 p-2 text-acorn-charcoal transition-colors hover:bg-acorn-stone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <dl className="mt-6 divide-y divide-acorn-bronze/15 border-y border-acorn-bronze/15 bg-white">
          {fields.map((field) => (
            <div
              key={field.key}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[13rem_1fr] sm:gap-6"
            >
              <dt className="font-heading text-[11px] uppercase tracking-[0.12em] text-acorn-charcoal/70">
                {field.label}
              </dt>
              <dd className="text-sm text-acorn-charcoal">
                {field.format === "resume" ? (
                  row.resume_filename ? (
                    <a
                      href={`/api/admin/resume/${row.id}`}
                      className="inline-flex items-center gap-2 font-semibold text-acorn-rust hover:underline"
                    >
                      <Download size={15} aria-hidden="true" />
                      {String(row.resume_filename)}
                    </a>
                  ) : (
                    <span className="text-acorn-charcoal/50">
                      No résumé attached
                    </span>
                  )
                ) : field.key === "email" ? (
                  <a
                    href={`mailto:${String(row.email)}`}
                    className="text-acorn-rust hover:underline"
                  >
                    {String(row.email)}
                  </a>
                ) : field.key === "phone" && row.phone ? (
                  <a
                    href={`tel:${String(row.phone).replace(/[^\d+]/g, "")}`}
                    className="text-acorn-rust hover:underline"
                  >
                    {String(row.phone)}
                  </a>
                ) : (
                  <span className="whitespace-pre-wrap break-words">
                    {formatValue(row[field.key], field.format)}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <form action={markUnread}>
              <input type="hidden" name="tab" value={tab} />
              <input type="hidden" name="id" value={row.id} />
              {Object.entries(listParams).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-sm border border-acorn-bronze/40 px-4 py-2 font-heading text-xs uppercase tracking-[0.15em] text-acorn-charcoal transition-colors hover:bg-acorn-stone"
              >
                <MailOpen size={14} aria-hidden="true" />
                Mark as Unread
              </button>
            </form>

            <DeleteButton
              tab={tab}
              id={row.id}
              name={name}
              hasResume={Boolean(row.resume_filename)}
              listParams={listParams}
              variant="button"
            />
          </div>

          <p className="text-xs text-acorn-charcoal/60">
            {row.read_at
              ? `Read ${formatValue(row.read_at, "datetime")}`
              : "Not yet marked read"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(closeHref)}
          className="mt-8 font-heading text-xs uppercase tracking-[0.15em] text-acorn-bronze hover:text-acorn-rust"
        >
          &larr; Back to all submissions
        </button>
      </div>
    </div>
  );
}
