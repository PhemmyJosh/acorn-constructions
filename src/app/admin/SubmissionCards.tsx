import Link from "next/link";
import { Paperclip } from "lucide-react";
import DeleteButton from "./DeleteButton";
import {
  CARD_FIELDS,
  formatValue,
  type SubmissionRow,
  type TabKey,
} from "@/lib/admin-data";

/**
 * Mobile view of the submissions list.
 *
 * The desktop table has up to nine columns, which on a phone can only be read
 * by scrolling sideways. Below the md breakpoint it is replaced by this: one
 * card per submission with the key fields stacked, so nothing needs horizontal
 * scrolling. Tapping a card opens the same detail view the table rows open.
 */
export default function SubmissionCards({
  tab,
  rows,
  listParams,
  hrefFor,
}: {
  tab: TabKey;
  rows: SubmissionRow[];
  listParams: Record<string, string>;
  hrefFor: (row: SubmissionRow) => string;
}) {
  const fields = CARD_FIELDS[tab];

  return (
    <ul className="mt-3 flex flex-col gap-3">
      {rows.map((row) => {
        const isUnread = !row.is_read;

        return (
          <li
            key={row.id}
            data-mobile-card
            className={`relative rounded-sm border ${
              isUnread
                ? "border-acorn-gold/50 bg-acorn-gold/[0.07]"
                : "border-acorn-bronze/20 bg-white"
            }`}
          >
            {/* One link over the whole card so the entire thing is a tap
                target. The delete button sits on top of it rather than inside,
                because a button nested in a link is invalid markup. */}
            <Link
              href={hrefFor(row)}
              // prefetch={false}: prefetching would run the page's
              // mark-as-read update before the card is actually opened.
              prefetch={false}
              className="block p-4 pr-14"
            >
              <div className="flex items-center gap-2">
                {isUnread && (
                  <span
                    aria-label="Unread"
                    className="h-2 w-2 shrink-0 rounded-full bg-acorn-rust"
                  />
                )}
                <span
                  className={`truncate text-base ${
                    isUnread
                      ? "font-semibold text-acorn-charcoal"
                      : "font-medium text-acorn-charcoal/80"
                  }`}
                >
                  {String(row.name)}
                </span>
              </div>

              <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                {fields.map((field) => {
                  // Careers: an indicator rather than a download link, since a
                  // link inside this card's link would not be reachable.
                  if (field.format === "resume") {
                    return (
                      <div key={field.key} className="flex gap-2">
                        <dt className="w-24 shrink-0 font-heading text-[11px] uppercase tracking-[0.1em] text-acorn-charcoal/55">
                          {field.label}
                        </dt>
                        <dd className="min-w-0 flex-1 text-acorn-charcoal/80">
                          {row.resume_filename ? (
                            <span className="inline-flex items-center gap-1.5 font-medium text-acorn-rust">
                              <Paperclip size={13} aria-hidden="true" />
                              Résumé attached
                            </span>
                          ) : (
                            <span className="text-acorn-charcoal/45">
                              No résumé
                            </span>
                          )}
                        </dd>
                      </div>
                    );
                  }

                  const value = formatValue(row[field.key], field.format);

                  return (
                    <div key={field.key} className="flex gap-2">
                      <dt className="w-24 shrink-0 font-heading text-[11px] uppercase tracking-[0.1em] text-acorn-charcoal/55">
                        {field.label}
                      </dt>
                      <dd
                        className={`min-w-0 flex-1 text-acorn-charcoal/80 ${
                          field.wrap
                            ? // Two lines, matching the table's truncation, so
                              // cards stay a consistent height.
                              "line-clamp-2 whitespace-pre-wrap break-words"
                            : "truncate"
                        }`}
                      >
                        {value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </Link>

            <div className="absolute right-2 top-2">
              <DeleteButton
                tab={tab}
                id={row.id}
                name={String(row.name)}
                hasResume={Boolean(row.resume_filename)}
                listParams={listParams}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
