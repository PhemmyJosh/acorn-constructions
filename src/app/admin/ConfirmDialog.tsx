"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

/**
 * In-page confirmation for destructive actions.
 *
 * Deliberately not window.confirm(): that is unstyled, unskippable by keyboard
 * conventions, and on some browsers suppressible by the user in a way that
 * would silently auto-confirm deletions.
 *
 * Rendered through a portal so it is never clipped by the table's
 * overflow-x-auto wrapper.
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onCancel,
  formAction,
  hiddenFields,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  onCancel: () => void;
  formAction: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);

    // Focus lands on Cancel, not Confirm, so a stray Enter cannot delete.
    cancelRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-acorn-charcoal/70"
      />

      <div className="relative w-full max-w-md rounded-sm border border-acorn-rust/40 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-acorn-rust"
          >
            <AlertTriangle size={22} />
          </span>
          <div>
            <h2 className="font-heading text-lg uppercase tracking-wide text-acorn-charcoal">
              {title}
            </h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-acorn-charcoal/80">
              {children}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-sm border border-acorn-bronze/40 px-4 py-2 font-heading text-xs uppercase tracking-[0.15em] text-acorn-charcoal transition-colors hover:bg-acorn-stone"
          >
            Cancel
          </button>
          <form action={formAction}>
            {Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <button
              type="submit"
              className="rounded-sm bg-acorn-rust px-4 py-2 font-heading text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-acorn-rust/90"
            >
              {confirmLabel}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
