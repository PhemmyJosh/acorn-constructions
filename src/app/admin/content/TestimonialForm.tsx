import { MessageSquarePlus } from "lucide-react";
import { saveTestimonial } from "../content-actions";
import type { TestimonialRow } from "@/lib/content-data";
import {
  fieldClasses,
  labelClasses,
  panelClasses,
  primaryButton,
  secondaryButton,
} from "./styles";

/**
 * Add/edit form for one testimonial. No client state is needed, so this stays
 * a server component and posts straight to the action.
 */
export default function TestimonialForm({
  testimonial,
}: {
  testimonial?: TestimonialRow;
}) {
  return (
    <form action={saveTestimonial} className={panelClasses}>
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}

      <h3 className="font-heading text-lg uppercase tracking-wide text-acorn-charcoal">
        {testimonial
          ? `Edit testimonial from ${testimonial.client_name}`
          : "Add new testimonial"}
      </h3>

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="testimonial-name" className={labelClasses}>
            Client name <span aria-hidden="true">*</span>
          </label>
          <input
            id="testimonial-name"
            name="client_name"
            type="text"
            required
            defaultValue={testimonial?.client_name ?? ""}
            className={fieldClasses}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="testimonial-role" className={labelClasses}>
            Role / project
          </label>
          <input
            id="testimonial-role"
            name="client_role"
            type="text"
            placeholder="Homeowner, Residential Addition"
            defaultValue={testimonial?.client_role ?? ""}
            className={fieldClasses}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="testimonial-location" className={labelClasses}>
            Location
          </label>
          <input
            id="testimonial-location"
            name="client_location"
            type="text"
            placeholder="Lloydminster, AB"
            defaultValue={testimonial?.client_location ?? ""}
            className={fieldClasses}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor="testimonial-quote" className={labelClasses}>
          Quote <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="testimonial-quote"
          name="quote"
          rows={4}
          required
          defaultValue={testimonial?.quote ?? ""}
          className={`resize-none ${fieldClasses}`}
        />
        <p className="text-xs text-acorn-charcoal/60">
          Quotation marks are added automatically on the site, so leave them out
          here.
        </p>
      </div>

      <label className="mt-5 flex w-fit cursor-pointer items-center gap-3 text-sm text-acorn-charcoal">
        <input
          type="checkbox"
          name="is_published"
          // New testimonials default to published; an existing one keeps its
          // current state so saving an edit never silently un-publishes it.
          defaultChecked={testimonial ? Boolean(testimonial.is_published) : true}
          className="h-4 w-4 accent-acorn-gold"
        />
        <span>
          <span className="font-semibold">Published</span>
          <span className="text-acorn-charcoal/60">
            {" "}
            — unpublished testimonials stay here but never appear on the site
          </span>
        </span>
      </label>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" className={primaryButton}>
          <MessageSquarePlus size={14} aria-hidden="true" />
          {testimonial ? "Save changes" : "Add testimonial"}
        </button>
        {testimonial && (
          <a href="/admin?tab=testimonials" className={secondaryButton}>
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}
