import { Eye, EyeOff } from "lucide-react";
import { getTestimonialRows } from "@/lib/content-data";
import { toggleTestimonialPublished } from "../content-actions";
import TestimonialOverlayProvider, {
  TestimonialCreateTrigger,
  TestimonialEditTrigger,
  TestimonialSaveAlert,
} from "./TestimonialOverlayProvider";
import { ContentDeleteButton, ReorderButtons } from "./ContentControls";
import {
  tableClasses,
  tableWrapper,
  tdClasses,
  thClasses,
  theadClasses,
} from "./styles";

/**
 * Testimonials tab. Unpublished rows stay listed but are visibly muted, so a
 * draft is obviously not live without having to open it.
 *
 * Both creating and editing open the same slide-in overlay — no inline form
 * and no ?edit= URL state — matching the Projects tab exactly.
 */
export default async function TestimonialsPanel() {
  const rows = await getTestimonialRows();

  return (
    <TestimonialOverlayProvider>
      {/* Top of the tab and right-aligned, so it reads as the primary action
          for this section rather than something buried under the table. */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-heading text-[11px] uppercase tracking-[0.15em] text-acorn-charcoal/60">
          {rows.length} {rows.length === 1 ? "testimonial" : "testimonials"}
        </p>
        <TestimonialCreateTrigger />
      </div>

      <TestimonialSaveAlert />

      <div className={tableWrapper}>
        <table className={tableClasses}>
          <thead className={theadClasses}>
            <tr>
              <th className={thClasses}>Published</th>
              <th className={thClasses}>Client</th>
              <th className={thClasses}>Quote</th>
              <th className={thClasses}>Order</th>
              {/* relative: sr-only is position:absolute, and with no
                  positioned ancestor it resolves against the initial containing
                  block, escaping this table's horizontal scroll container and
                  making the whole page scroll sideways on mobile. */}
              <th className={`${thClasses} relative`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className={`${tdClasses} py-6`} colSpan={5}>
                  No testimonials yet. The site is showing its built-in ones
                  until you add some.
                </td>
              </tr>
            )}

            {rows.map((row, index) => {
              const published = Boolean(row.is_published);
              return (
                <tr
                  key={row.id}
                  className={`border-t border-acorn-bronze/15 ${
                    published ? "even:bg-acorn-cream/50" : "bg-acorn-stone/40"
                  }`}
                >
                  <td className={`${tdClasses} whitespace-nowrap`}>
                    <form action={toggleTestimonialPublished}>
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        aria-label={
                          published
                            ? `Unpublish testimonial from ${row.client_name}`
                            : `Publish testimonial from ${row.client_name}`
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                          published
                            ? "bg-acorn-gold text-acorn-charcoal hover:brightness-95"
                            : "border border-acorn-bronze/40 text-acorn-charcoal/60 hover:bg-acorn-stone"
                        }`}
                      >
                        {published ? (
                          <Eye size={13} aria-hidden="true" />
                        ) : (
                          <EyeOff size={13} aria-hidden="true" />
                        )}
                        {published ? "Live" : "Draft"}
                      </button>
                    </form>
                  </td>
                  <td className={tdClasses}>
                    <div className="font-semibold text-acorn-charcoal">
                      {row.client_name}
                    </div>
                    {row.client_role && (
                      <div className="text-xs text-acorn-charcoal/60">
                        {row.client_role}
                      </div>
                    )}
                    {row.client_location && (
                      <div className="text-xs text-acorn-charcoal/50">
                        {row.client_location}
                      </div>
                    )}
                  </td>
                  <td className={tdClasses}>
                    <div className="max-w-md text-acorn-charcoal/75">
                      {row.quote.length > 160
                        ? `${row.quote.slice(0, 160)}…`
                        : row.quote}
                    </div>
                  </td>
                  {/* The arrows are the whole interface here. display_order is
                      an internal number — it counts in tens so a swap has room
                      to move — and showing it invited the admin to read meaning
                      into values that have none. */}
                  <td className={`${tdClasses} whitespace-nowrap`}>
                    <ReorderButtons
                      table="testimonials"
                      id={row.id}
                      isFirst={index === 0}
                      isLast={index === rows.length - 1}
                    />
                  </td>
                  <td className={`${tdClasses} whitespace-nowrap`}>
                    <div className="flex items-center gap-1">
                      <TestimonialEditTrigger testimonial={row} />
                      <ContentDeleteButton
                        kind="testimonial"
                        id={row.id}
                        name={row.client_name}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TestimonialOverlayProvider>
  );
}
