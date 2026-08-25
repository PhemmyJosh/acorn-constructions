"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { saveProject } from "../content-actions";
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_MB,
  PROJECT_CATEGORIES,
  projectImageSrc,
  type ProjectRow,
} from "@/lib/content-constants";
import {
  fieldClasses,
  labelClasses,
  panelClasses,
  primaryButton,
  secondaryButton,
} from "./styles";

/**
 * Add/edit form for one project.
 *
 * The image preview is a local object URL, so the client sees exactly what is
 * about to be uploaded before submitting. Size and type are still validated
 * server-side — this check is only there to fail fast.
 */
export default function ProjectForm({ project }: { project?: ProjectRow }) {
  const existingSrc = project ? projectImageSrc(project.image_filename) : null;

  const [preview, setPreview] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setLocalError(null);

    if (!file) {
      setPreview(null);
      setPreviewName(null);
      return;
    }

    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      setLocalError(
        `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. Choose one under ${IMAGE_MAX_MB}MB.`
      );
      event.target.value = "";
      setPreview(null);
      setPreviewName(null);
      return;
    }

    setPreview(URL.createObjectURL(file));
    setPreviewName(file.name);
  }

  return (
    <form action={saveProject} className={panelClasses}>
      {project && <input type="hidden" name="id" value={project.id} />}

      <h3 className="font-heading text-lg uppercase tracking-wide text-acorn-charcoal">
        {project ? `Edit "${project.title}"` : "Add new project"}
      </h3>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="project-title" className={labelClasses}>
            Title <span aria-hidden="true">*</span>
          </label>
          <input
            id="project-title"
            name="title"
            type="text"
            required
            defaultValue={project?.title ?? ""}
            className={fieldClasses}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="project-category" className={labelClasses}>
            Category
          </label>
          <select
            id="project-category"
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
        <label htmlFor="project-image" className={labelClasses}>
          Photo {project ? "(leave empty to keep the current one)" : "*"}
        </label>
        <input
          id="project-image"
          name="image"
          type="file"
          accept={IMAGE_ACCEPT}
          required={!project}
          onChange={onFileChange}
          className="rounded-sm border border-acorn-bronze/30 bg-white p-2 text-sm text-acorn-charcoal/80 file:mr-4 file:cursor-pointer file:rounded-sm file:border-0 file:bg-acorn-charcoal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-acorn-cream"
        />
        <p className="text-xs text-acorn-charcoal/60">
          JPG, PNG or WEBP. Maximum {IMAGE_MAX_MB}MB.
        </p>
        {localError && (
          <p role="alert" className="text-xs font-semibold text-acorn-rust">
            {localError}
          </p>
        )}

        {(preview || existingSrc) && (
          <div className="mt-2 flex items-center gap-4">
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-sm border border-acorn-bronze/20 bg-acorn-stone">
              {preview ? (
                // A blob: URL cannot go through the optimiser, so this preview
                // is a plain <img>. The stored photo below uses next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt=""
                  className="h-full w-full object-cover"
                />
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
        <label htmlFor="project-caption" className={labelClasses}>
          Caption
        </label>
        <input
          id="project-caption"
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
        <label htmlFor="project-description" className={labelClasses}>
          Description
        </label>
        <textarea
          id="project-description"
          name="description"
          rows={3}
          defaultValue={project?.description ?? ""}
          className={`resize-none ${fieldClasses}`}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" className={primaryButton}>
          <ImagePlus size={14} aria-hidden="true" />
          {project ? "Save changes" : "Add project"}
        </button>
        {project && (
          <a href="/admin?tab=projects" className={secondaryButton}>
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}
