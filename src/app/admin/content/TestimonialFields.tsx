"use client";

import { type TestimonialRow } from "@/lib/content-constants";
import { fieldClasses, labelClasses } from "./styles";

/**
 * The testimonial form's fields, so create and edit cannot drift apart.
 *
 * Field ids are prefixed because two overlays can in principle be mounted at
 * once, and duplicate ids would point every label at the wrong input.
 */
export default function TestimonialFields({
  testimonial,
  idPrefix,
  fieldErrors,
}: {
  testimonial?: TestimonialRow;
  idPrefix: string;
  /** Per-field messages returned by the server action. */
  fieldErrors?: Record<string, string>;
}) {
  const errorFor = (field: string) => fieldErrors?.[field] ?? null;

  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-name`} className={labelClasses}>
          Client name <span aria-hidden="true">*</span>
        </label>
        <input
          id={`${idPrefix}-name`}
          name="client_name"
          type="text"
          required
          defaultValue={testimonial?.client_name ?? ""}
          aria-invalid={errorFor("client_name") ? true : undefined}
          aria-describedby={
            errorFor("client_name") ? `${idPrefix}-name-error` : undefined
          }
          className={fieldClasses}
        />
        {errorFor("client_name") && (
          <p
            id={`${idPrefix}-name-error`}
            role="alert"
            className="text-xs font-semibold text-acorn-rust"
          >
            {errorFor("client_name")}
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-role`} className={labelClasses}>
            Role / project
          </label>
          <input
            id={`${idPrefix}-role`}
            name="client_role"
            type="text"
            placeholder="Homeowner, Residential Addition"
            defaultValue={testimonial?.client_role ?? ""}
            className={fieldClasses}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-location`} className={labelClasses}>
            Location
          </label>
          <input
            id={`${idPrefix}-location`}
            name="client_location"
            type="text"
            placeholder="Lloydminster, AB"
            defaultValue={testimonial?.client_location ?? ""}
            className={fieldClasses}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-quote`} className={labelClasses}>
          Quote <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={`${idPrefix}-quote`}
          name="quote"
          rows={5}
          required
          defaultValue={testimonial?.quote ?? ""}
          aria-invalid={errorFor("quote") ? true : undefined}
          aria-describedby={
            errorFor("quote") ? `${idPrefix}-quote-error` : undefined
          }
          className={`resize-none ${fieldClasses}`}
        />
        <p className="text-xs text-acorn-charcoal/60">
          Quotation marks are added automatically on the site, so leave them out
          here.
        </p>
        {errorFor("quote") && (
          <p
            id={`${idPrefix}-quote-error`}
            role="alert"
            className="text-xs font-semibold text-acorn-rust"
          >
            {errorFor("quote")}
          </p>
        )}
      </div>

      <label className="mt-5 flex w-fit cursor-pointer items-start gap-3 text-sm text-acorn-charcoal">
        <input
          type="checkbox"
          name="is_published"
          // New testimonials default to published; an existing one keeps its
          // current state so saving an edit never silently un-publishes it.
          defaultChecked={
            testimonial ? Boolean(testimonial.is_published) : true
          }
          className="mt-0.5 h-4 w-4 shrink-0 accent-acorn-gold"
        />
        <span>
          <span className="font-semibold">Published</span>
          <span className="text-acorn-charcoal/60">
            {" "}
            — unpublished testimonials stay here but never appear on the site
          </span>
        </span>
      </label>
    </>
  );
}
