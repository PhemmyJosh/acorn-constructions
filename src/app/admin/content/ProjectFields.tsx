"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_MB,
  PROJECT_CATEGORIES,
  projectImageSrc,
  type ProjectRow,
} from "@/lib/content-constants";
import { fieldClasses, labelClasses } from "./styles";

/**
 * The project form's fields, shared by the inline edit form and the create
 * overlay so the two cannot drift apart.
 *
 * Field ids are prefixed because the edit form and the overlay can both be
 * mounted at once — the overlay opens over a page that may already be editing
 * a row — and duplicate ids would point every label at the wrong input.
 */
export default function ProjectFields({
  project,
  idPrefix,
  fieldErrors,
  onLocalErrorChange,
}: {
  project?: ProjectRow;
  idPrefix: string;
  /** Per-field messages returned by the server action. */
  fieldErrors?: Record<string, string>;
  /**
   * Reports a client-side problem (currently only an oversized file) so the
   * parent can keep the submit button disabled while it stands.
   */
  onLocalErrorChange?: (error: string | null) => void;
}) {
  const existingSrc = project ? projectImageSrc(project.image_filename) : null;

  const [preview, setPreview] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    onLocalErrorChange?.(localError);
  }, [localError, onLocalErrorChange]);

  // Object URLs hold the file in memory until revoked.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setLocalError(null);

    if (!file) {
      setPreview(null);
      setPreviewName(null);
      return;
    }

    // Caught here so an oversized file never leaves the browser. Without this
    // the request would be refused while its body was still being parsed,
    // before any server code could turn it into a readable message.
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      setLocalError(
        `That photo is ${(file.size / 1024 / 1024).toFixed(
          1
        )}MB, over the ${IMAGE_MAX_MB}MB limit. Choose a smaller one, or resize it and try again.`
      );
      // Cleared so the form cannot be submitted with it still attached.
      event.target.value = "";
      setPreview(null);
      setPreviewName(null);
      return;
    }

    setPreview(URL.createObjectURL(file));
    setPreviewName(file.name);
  }

  const imageError = localError ?? fieldErrors?.image ?? null;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-title`} className={labelClasses}>
            Title <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${idPrefix}-title`}
            name="title"
            type="text"
            required
            defaultValue={project?.title ?? ""}
            aria-invalid={fieldErrors?.title ? true : undefined}
            aria-describedby={fieldErrors?.title ? `${idPrefix}-title-error` : undefined}
            className={fieldClasses}
          />
          {fieldErrors?.title && (
            <p
              id={`${idPrefix}-title-error`}
              role="alert"
              className="text-xs font-semibold text-acorn-rust"
            >
              {fieldErrors.title}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-category`} className={labelClasses}>
            Category
          </label>
          <select
            id={`${idPrefix}-category`}
            name="category"
            defaultValue={project?.category ?? "residential"}
            className={`${fieldClasses} cursor-pointer`}
          >
            {PROJECT_CATEGORIES.map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-image`} className={labelClasses}>
          Photo {project ? "(leave empty to keep the current one)" : "*"}
        </label>
        <input
          id={`${idPrefix}-image`}
          name="image"
          type="file"
          accept={IMAGE_ACCEPT}
          required={!project}
          onChange={onFileChange}
          aria-invalid={imageError ? true : undefined}
          aria-describedby={imageError ? `${idPrefix}-image-error` : undefined}
          className="rounded-sm border border-acorn-bronze/30 bg-white p-2 text-sm text-acorn-charcoal/80 file:mr-4 file:cursor-pointer file:rounded-sm file:border-0 file:bg-acorn-charcoal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-acorn-cream"
        />
        <p className="text-xs text-acorn-charcoal/60">
          JPG, PNG or WEBP. Maximum {IMAGE_MAX_MB}MB.
        </p>
        {imageError && (
          <p
            id={`${idPrefix}-image-error`}
            role="alert"
            className="rounded-sm border border-acorn-rust/40 bg-acorn-rust/5 px-3 py-2 text-xs font-semibold text-acorn-rust"
          >
            {imageError}
          </p>
        )}

        {(preview || existingSrc) && (
          <div className="mt-2 flex items-center gap-4">
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-sm border border-acorn-bronze/20 bg-acorn-stone">
              {preview ? (
                // A blob: URL cannot go through the optimiser, so this preview
                // is a plain <img>. The stored photo below uses next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <Image
                  src={existingSrc!}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              )}
            </div>
            <p className="text-xs text-acorn-charcoal/70">
              {preview ? (
                <>
                  New photo selected:{" "}
                  <span className="font-semibold">{previewName}</span>
                </>
              ) : (
                "Current photo"
              )}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-caption`} className={labelClasses}>
          Caption
        </label>
        <input
          id={`${idPrefix}-caption`}
          name="caption"
          type="text"
          defaultValue={project?.caption ?? ""}
          className={fieldClasses}
        />
        <p className="text-xs text-acorn-charcoal/60">
          Also used as the image&apos;s alt text for screen readers and search
          engines, so describe what is in the photo.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-description`} className={labelClasses}>
          Description
        </label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          rows={3}
          defaultValue={project?.description ?? ""}
          className={`resize-none ${fieldClasses}`}
        />
      </div>
    </>
  );
}
