"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, MessageSquarePlus, Save, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import TestimonialFields from "./TestimonialFields";
import { saveTestimonialFromOverlay } from "./testimonial-save-action";
import { testimonialSaveInitialState } from "./testimonial-save-state";
import { type TestimonialRow } from "@/lib/content-constants";
import { primaryButton, secondaryButton } from "./styles";

/** Everything inside the panel that can take focus. */
const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Slide-in panel for creating *or* editing a testimonial.
 *
 * Deliberately the same shape as ProjectOverlay rather than a variation on it:
 * the two tabs do the same job, and an admin who has learned one should not
 * have to learn the other. The only differences here are the fields and the
 * absence of a file upload.
 */
export default function TestimonialOverlay({
  testimonial,
  onClose,
  onSaved,
}: {
  /** Omitted when creating; the row being edited otherwise. */
  testimonial?: TestimonialRow;
  onClose: () => void;
  onSaved: (name: string, mode: "created" | "updated") => void;
}) {
  const isEdit = testimonial !== undefined;
  const [state, formAction, isPending] = useActionState(
    saveTestimonialFromOverlay,
    testimonialSaveInitialState
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [dirty, setDirty] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  /**
   * Close, or ask first when there is work to lose. Held in a ref as well so
   * the mount-only key handler below never closes over a stale copy.
   */
  const requestClose = useCallback(() => {
    if (isPending) return; // A save is in flight; let it finish.
    if (dirty) {
      setConfirmingDiscard(true);
      return;
    }
    onClose();
  }, [dirty, isPending, onClose]);

  const handlers = useRef({ requestClose });
  useEffect(() => {
    handlers.current = { requestClose };
  }, [requestClose]);

  useEffect(() => {
    const panel = panelRef.current;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handlers.current.requestClose();
        return;
      }

      if (event.key === "Tab") {
        if (!panel) return;
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter(
          (element) =>
            element.offsetParent !== null && !element.hasAttribute("disabled")
        );
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (!panel.contains(active)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
          return;
        }
        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
          return;
        }
        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    // Focus the first field rather than the panel, so typing can start at once.
    panel?.querySelector<HTMLInputElement>("input[name='client_name']")?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, []);

  // Success is reported by the action's return value, so the close happens
  // here rather than inside the action, which cannot touch the client.
  useEffect(() => {
    if (state.status === "success" && state.savedName) {
      onSaved(state.savedName, state.mode ?? "created");
    }
  }, [state, onSaved]);

  if (typeof document === "undefined") return null;

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: "easeOut" as const };

  const heading = isEdit ? "Edit testimonial" : "Create new testimonial";

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      {/* Clicking away closes, via the same guarded path as Escape. */}
      <motion.button
        type="button"
        aria-label="Close without saving"
        onClick={requestClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transition}
        className="absolute inset-0 cursor-default bg-acorn-charcoal/60"
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
        animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
        transition={transition}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto overscroll-contain bg-acorn-cream shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-acorn-bronze/25 bg-white px-6 py-5">
          <div className="min-w-0">
            <p className="font-heading text-xs uppercase tracking-[0.2em] text-acorn-bronze">
              Testimonials
            </p>
            <h2 className="mt-1 font-heading text-xl uppercase tracking-wide text-acorn-charcoal">
              {heading}
            </h2>
            {isEdit && (
              <p className="mt-1 truncate text-sm text-acorn-charcoal/70">
                {testimonial.client_name}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close without saving"
            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-acorn-charcoal/60 transition-colors hover:bg-acorn-stone hover:text-acorn-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form
          action={formAction}
          // onInput covers typing; onChange is what the Published checkbox
          // actually fires through React, and ticking it is a change worth
          // protecting just as much as typing is.
          onInput={() => setDirty(true)}
          onChange={() => setDirty(true)}
          className="flex flex-1 flex-col px-6 py-6"
        >
          {isEdit && <input type="hidden" name="id" value={testimonial.id} />}

          {state.error && (
            <p
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-sm border border-acorn-rust/40 bg-acorn-rust/5 px-4 py-3 text-sm text-acorn-rust"
            >
              <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </p>
          )}

          <TestimonialFields
            testimonial={testimonial}
            idPrefix={isEdit ? `edit-testimonial-${testimonial.id}` : "new-testimonial"}
            fieldErrors={state.fieldErrors}
          />

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-acorn-bronze/20 pt-6">
            <button
              type="submit"
              disabled={isPending}
              className={`${primaryButton} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {isPending ? (
                <>
                  <Loader2
                    size={14}
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : isEdit ? (
                <>
                  <Save size={14} aria-hidden="true" />
                  Save changes
                </>
              ) : (
                <>
                  <MessageSquarePlus size={14} aria-hidden="true" />
                  Create testimonial
                </>
              )}
            </button>
            <button
              type="button"
              onClick={requestClose}
              disabled={isPending}
              className={`${secondaryButton} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>

      {/* Deliberately not ConfirmDialog: that one submits a server action, and
          this only needs to decide whether to throw away local state. */}
      {confirmingDiscard && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Discard your changes?"
          className="absolute inset-0 z-10 flex items-center justify-center px-4"
        >
          <button
            type="button"
            aria-label="Keep editing"
            onClick={() => setConfirmingDiscard(false)}
            className="absolute inset-0 cursor-default bg-acorn-charcoal/70"
          />
          <div className="relative w-full max-w-md rounded-sm border border-acorn-rust/40 bg-white p-6 shadow-xl">
            <h3 className="font-heading text-lg uppercase tracking-wide text-acorn-charcoal">
              Discard your changes?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-acorn-charcoal/80">
              {isEdit
                ? "You have changed some details. Closing now throws those changes away and the testimonial stays as it was."
                : "You have filled in some details. Closing now throws them away and nothing is saved."}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmingDiscard(false)}
                className="rounded-sm border border-acorn-bronze/40 px-4 py-2 font-heading text-xs uppercase tracking-[0.15em] text-acorn-charcoal transition-colors hover:bg-acorn-stone"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingDiscard(false);
                  onClose();
                }}
                className="rounded-sm bg-acorn-rust px-4 py-2 font-heading text-xs uppercase tracking-[0.15em] text-white transition-colors hover:bg-acorn-rust/90"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
