"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";
import { deleteProject, deleteTestimonial, moveContent } from "../content-actions";

/** Shared button chrome so every control in the content tabs matches. */
const ICON_BUTTON =
  "rounded-sm border border-acorn-bronze/30 p-1.5 text-acorn-charcoal/60 transition-colors hover:bg-acorn-stone hover:text-acorn-charcoal disabled:cursor-not-allowed disabled:opacity-30";

/** Up/down reorder pair. Disabled at the ends rather than hidden, so the row
 *  controls do not shift position between rows. */
export function ReorderButtons({
  table,
  id,
  isFirst,
  isLast,
}: {
  table: "projects" | "testimonials";
  id: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <form action={moveContent}>
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="up" />
        <button
          type="submit"
          disabled={isFirst}
          aria-label="Move up"
          title="Move up"
          className={ICON_BUTTON}
        >
          <ChevronUp size={15} aria-hidden="true" />
        </button>
      </form>
      <form action={moveContent}>
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="direction" value="down" />
        <button
          type="submit"
          disabled={isLast}
          aria-label="Move down"
          title="Move down"
          className={ICON_BUTTON}
        >
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

/** Delete with the same confirm-first pattern used for form submissions. */
export function ContentDeleteButton({
  kind,
  id,
  name,
  hasUploadedImage,
}: {
  kind: "project" | "testimonial";
  id: number;
  name: string;
  /** Projects only: warns that the photo file goes with the row. */
  hasUploadedImage?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`Delete ${kind} ${name}`}
        title={`Delete ${kind}`}
        onClick={() => setOpen(true)}
        className="rounded-sm p-1.5 text-acorn-charcoal/45 transition-colors hover:bg-acorn-rust/10 hover:text-acorn-rust"
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>

      <ConfirmDialog
        open={open}
        title={kind === "project" ? "Delete this project?" : "Delete this testimonial?"}
        confirmLabel="Delete permanently"
        onCancel={() => setOpen(false)}
        formAction={kind === "project" ? deleteProject : deleteTestimonial}
        hiddenFields={{ id: String(id) }}
      >
        <p>
          This removes{" "}
          <span className="font-semibold text-acorn-charcoal">{name}</span> from
          the live site immediately. There is no undo.
        </p>
        {kind === "project" && hasUploadedImage && (
          <p className="rounded-sm border border-acorn-rust/30 bg-acorn-rust/5 px-3 py-2 text-acorn-rust">
            The uploaded photo is deleted from the server as well. If it is the
            only copy, save it somewhere else first.
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
