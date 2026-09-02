"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Project } from "@/types";

interface LightboxProps {
  project: Project;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/** Everything inside the dialog that can take focus. */
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function Lightbox({
  project,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Kept in a ref so the key handler below can stay on a stable, mount-only
  // effect: re-subscribing on every prop change would tear the listener down
  // and rebuild it on each arrow press. onPrev/onNext change identity whenever
  // the filtered set changes, so this keeps the handler pointed at the current
  // pair rather than a stale closure over the old category's length.
  const handlers = useRef({ onClose, onPrev, onNext });

  useEffect(() => {
    handlers.current = { onClose, onPrev, onNext };
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const dialog = dialogRef.current;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        handlers.current.onClose();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlers.current.onPrev();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handlers.current.onNext();
        return;
      }

      // Focus trap: cycle within the dialog instead of moving to the page
      // behind it. The dialog holds only the three controls, so this wraps
      // between close / previous / next.
      if (event.key === "Tab") {
        if (!dialog) return;
        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((element) => element.offsetParent !== null);
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        // Also covers focus having escaped the dialog entirely, in which case
        // the next Tab pulls it back in rather than continuing down the page.
        if (!dialog.contains(active)) {
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

    // Move focus in so the very first Tab or arrow press lands here rather
    // than wherever the page happened to be.
    dialog?.focus();

    // The page behind a modal should not scroll under it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      // Focusable programmatically but not in the tab order itself.
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-acorn-charcoal/95 p-4 outline-none sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full text-acorn-cream transition-colors hover:bg-acorn-cream/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold"
      >
        <X size={24} />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
        aria-label="Previous project"
        className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-acorn-cream transition-colors hover:bg-acorn-cream/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold sm:left-6"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        aria-label="Next project"
        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-acorn-cream transition-colors hover:bg-acorn-cream/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold sm:right-6"
      >
        <ChevronRight size={28} />
      </button>

      <div
        className="relative flex w-full max-w-4xl flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
          <Image
            src={project.image}
            alt={project.alt}
            fill
            sizes="(min-width: 896px) 896px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-acorn-gold">
            {project.category}
          </span>
          <p className="text-lg font-semibold text-acorn-cream">
            {project.title}
          </p>
          {project.description && (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-acorn-cream/75">
              {project.description}
            </p>
          )}
          {/* Announced on open and on each arrow press, so a screen-reader
              user hears which project they have moved to. */}
          <p aria-live="polite" className="sr-only">
            {project.title}, {project.category}
          </p>
        </div>
      </div>
    </div>
  );
}
