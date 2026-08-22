"use client";

import { useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import { company } from "@/data/company";

/**
 * Shared loading / success / error UI for the three public forms, so all of
 * them behave and read identically rather than each inventing its own pattern.
 *
 * Palette: gold is the site's positive accent, rust is the error tone — clear
 * without being an alarming pure red. Reduced motion is handled in one place,
 * `statusTransition`, which collapses to a zero-duration transition.
 */

const FADE_DURATION = 0.35;

/** Clearance for the fixed site header (72px) plus breathing room. */
const HEADER_OFFSET = 104;

function useStatusTransition() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion
    ? { duration: 0 }
    : { duration: FADE_DURATION, ease: "easeOut" as const };
}

/* -------------------------------------------------------------------------- */
/* Submission state                                                            */
/* -------------------------------------------------------------------------- */

export type SubmissionStatus = "idle" | "sending" | "success";

/**
 * Tracks the lifecycle of one form submission.
 *
 * `hasSubmittedBefore` drives the persistent notice above a re-opened form, so
 * a user who chooses to submit again still has a record that the previous one
 * went through.
 */
export function useFormSubmission() {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  /**
   * Brings the top of the form (or the panel that replaced it) into view.
   *
   * Needed in both directions: swapping a tall form for a short success panel
   * shrinks the page, and the browser clamps the scroll position, which can
   * leave the confirmation tucked under the fixed site header. Going back the
   * other way can leave the user scrolled past the first fields.
   *
   * Offset rather than plain scrollIntoView because the header is fixed and
   * would otherwise cover the first ~72px of the target.
   */
  function scrollContainerIntoView() {
    const node = containerRef.current;
    if (!node) return;

    // Wait for the swapped-in content to be laid out before measuring.
    requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      if (rect.top >= HEADER_OFFSET && rect.top < 260) return;

      window.scrollTo({
        top: Math.max(0, rect.top + window.scrollY - HEADER_OFFSET),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  function begin() {
    setStatus("sending");
    setError(null);
  }

  function succeed() {
    setStatus("success");
    setError(null);
    setHasSubmittedBefore(true);
    scrollContainerIntoView();
  }

  function fail(message: string | null) {
    setStatus("idle");
    setError(message);
  }

  /** Returns to a blank, editable form. */
  function reset() {
    setStatus("idle");
    setError(null);
    scrollContainerIntoView();
  }

  return {
    status,
    error,
    isSending: status === "sending",
    isSuccess: status === "success",
    hasSubmittedBefore,
    containerRef,
    begin,
    succeed,
    fail,
    reset,
  };
}

/* -------------------------------------------------------------------------- */
/* Presentational pieces                                                       */
/* -------------------------------------------------------------------------- */

/** Submit button with a consistent in-flight label and spinner. */
export function FormSubmitButton({
  isSending,
  children,
  sendingLabel = "Sending...",
  className = "",
}: {
  isSending: boolean;
  children: ReactNode;
  sendingLabel?: string;
  className?: string;
}) {
  return (
    <Button type="submit" variant="primary" disabled={isSending} className={className}>
      {isSending ? (
        <>
          {/* The label carries the meaning, so stopping the spin under
              reduced motion loses nothing. */}
          <Loader2
            size={16}
            aria-hidden="true"
            className="animate-spin motion-reduce:animate-none"
          />
          {sendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/**
 * Inline failure message, shown next to the submit button. Always offers a way
 * to reach the company that does not depend on the thing that just failed.
 */
export function FormError({ children }: { children: ReactNode }) {
  const transition = useStatusTransition();

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className="flex items-start gap-3 rounded-sm border border-acorn-rust/40 bg-acorn-rust/5 px-4 py-3 text-sm text-acorn-rust"
    >
      <AlertCircle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div>
        <p>{children}</p>
        <p className="mt-1 text-acorn-rust/85">
          If it keeps happening, reach us directly at{" "}
          <a href={company.phoneHref} className="font-semibold underline">
            {company.phoneDisplay}
          </a>{" "}
          or{" "}
          <a href={`mailto:${company.email}`} className="font-semibold underline">
            {company.email}
          </a>
          .
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Slim reminder shown above a form the user re-opened with "submit another",
 * so the earlier confirmation is not simply wiped away. Worded in the past
 * tense so an empty form is never mistaken for a submitted one.
 */
export function PreviousSubmissionNotice({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded-sm border border-acorn-gold/40 bg-acorn-stone px-4 py-3 text-sm text-acorn-charcoal/80">
      <CheckCircle2
        size={18}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-acorn-bronze"
      />
      <span>{children}</span>
    </p>
  );
}

/**
 * Replaces the form on success: confirmation, what happens next, and a way
 * back to a blank form. Never auto-dismissed.
 */
export function FormSuccess({
  headline,
  children,
  buttonLabel,
  onReset,
}: {
  headline: string;
  children: ReactNode;
  buttonLabel: string;
  onReset: () => void;
}) {
  const transition = useStatusTransition();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className="rounded-sm border border-acorn-gold/40 bg-acorn-stone p-8"
    >
      <div className="flex items-start gap-4">
        {/* Charcoal glyph on solid gold, the same treatment used for the core
            value icons, which clears AA where cream on gold does not. */}
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-acorn-gold text-acorn-charcoal"
        >
          <CheckCircle2 size={22} />
        </span>

        <div>
          <h3
            // Announced on render, so a keyboard or screen-reader user knows
            // the form was replaced.
            role="status"
            className="font-heading text-xl uppercase tracking-wide text-acorn-charcoal"
          >
            {headline}
          </h3>
          <div className="mt-2 space-y-2 text-sm leading-relaxed text-acorn-charcoal/75">
            {children}
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={onReset}
        className="mt-6 px-6 py-3 text-xs"
      >
        {buttonLabel}
      </Button>
    </motion.div>
  );
}
