"use client";

import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Card from "@/components/ui/Card";
import type { Testimonial } from "@/types";

/**
 * Continuously scrolling single-row testimonial marquee.
 *
 * Driven by requestAnimationFrame rather than a CSS animation. A CSS keyframe
 * animation would be less code, but changing `animation-duration` to slow the
 * scroll on hover restarts the timing function, which snaps the row to a new
 * position. Advancing an offset by hand means the speed can be eased smoothly
 * from full to slow and back with no jump.
 *
 * Seamlessness comes from rendering the set repeatedly and wrapping the offset
 * modulo the width of one set: when copy one has scrolled fully out of view,
 * copy two is pixel-identical to where copy one began, so the reset is
 * invisible.
 */

/** Pixels per second at rest and while the reader is engaging with a card. */
const SPEED_NORMAL = 45;
const SPEED_SLOW = 8;

/** Seconds to ease between the two speeds. Small enough to feel responsive. */
const EASE_TAU = 0.28;

export default function TestimonialsMarquee({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);

  // One set is often narrower than the viewport, in which case two copies
  // would leave a gap. Enough copies are rendered to cover the viewport plus a
  // full set. Starts at 2 so the server and first client render agree.
  const [copies, setCopies] = useState(2);

  const prefersReducedMotion = useReducedMotion();

  // Read by the animation loop, written by the pointer handlers, so changing
  // speed never restarts the loop.
  const targetSpeed = useRef(SPEED_NORMAL);

  /* ---- how many copies are needed ---- */
  useEffect(() => {
    if (prefersReducedMotion) return;

    function measure() {
      const viewport = viewportRef.current;
      const group = groupRef.current;
      if (!viewport || !group) return;

      const setWidth = group.getBoundingClientRect().width;
      if (setWidth === 0) return;

      const needed = Math.ceil(viewport.clientWidth / setWidth) + 1;
      setCopies(Math.max(2, needed));
    }

    measure();
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (groupRef.current) observer.observe(groupRef.current);
    return () => observer.disconnect();
  }, [prefersReducedMotion, testimonials.length]);

  /* ---- the scroll loop ---- */
  useEffect(() => {
    if (prefersReducedMotion) return;

    let frame = 0;
    let offset = 0;
    let speed = SPEED_NORMAL;
    let last = performance.now();

    function step(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp after a tab switch
      last = now;

      // Exponential approach, so the change of pace reads as a deceleration
      // rather than a snap.
      speed += (targetSpeed.current - speed) * (1 - Math.exp(-dt / EASE_TAU));

      const group = groupRef.current;
      const setWidth = group ? group.getBoundingClientRect().width : 0;

      if (setWidth > 0) {
        offset += speed * dt;
        // The wrap point: one full set. Copy two sits exactly where copy one
        // started, so this is invisible.
        offset %= setWidth;
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${-offset}px, 0, 0)`;
        }
      }

      frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

  if (testimonials.length === 0) return null;

  const slow = () => {
    targetSpeed.current = SPEED_SLOW;
  };
  const resume = () => {
    targetSpeed.current = SPEED_NORMAL;
  };

  /* ---- reduced motion: a static row the visitor scrolls themselves ---- */
  if (prefersReducedMotion) {
    return (
      <div
        className="mt-14 -mx-6 overflow-x-auto px-6 pb-2 sm:-mx-8 sm:px-8"
        // Still one row, never wrapping, but no automatic movement.
        data-marquee="static"
      >
        <ul className="flex w-max items-stretch gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
            />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      // Full-bleed so cards run to both edges rather than stopping inside the
      // container's padding, which reads as a broken row.
      className="relative mt-14 -mx-6 overflow-hidden sm:-mx-8"
      data-marquee="scrolling"
      onMouseEnter={slow}
      onMouseLeave={resume}
      // Touchscreens have no hover, so the same slowdown is wired to touch.
      onTouchStart={slow}
      onTouchEnd={resume}
      onTouchCancel={resume}
    >
      {/* Fades at both edges, in this section's own background tone, so cards
          look like they are moving in and out rather than being cut off at a
          hard boundary. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-acorn-stone to-transparent sm:w-16"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-acorn-stone to-transparent sm:w-16"
      />

      <div
        ref={trackRef}
        data-marquee-track
        className="flex w-max will-change-transform"
      >
        {Array.from({ length: copies }, (_, copy) => (
          <ul
            key={copy}
            // Only the first set is exposed to assistive tech; the rest exist
            // purely so the loop has something to scroll into.
            ref={copy === 0 ? groupRef : undefined}
            aria-hidden={copy > 0 ? true : undefined}
            className="flex items-stretch gap-8 pl-8"
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={`${copy}-${testimonial.name}`}
                testimonial={testimonial}
              />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * Fixed width so spacing stays even however long the quote is, and
 * items-stretch on the row equalises the heights. The quote is deliberately
 * not line-clamped: truncating a testimonial mid-sentence would defeat it.
 */
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <li className="w-[19rem] shrink-0 sm:w-[22rem]">
      <Card className="flex h-full flex-col gap-6 border-acorn-bronze/25 bg-white shadow-md">
        <Quote className="shrink-0 text-acorn-gold" size={28} aria-hidden="true" />
        <p className="text-base leading-relaxed text-acorn-charcoal/80">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
        <div className="mt-auto border-t border-acorn-bronze/15 pt-4">
          <p className="text-sm font-semibold text-acorn-charcoal">
            {testimonial.name}
          </p>
          {testimonial.role && (
            <p className="text-sm text-acorn-charcoal/60">{testimonial.role}</p>
          )}
          {testimonial.location && (
            <p className="text-xs font-semibold uppercase tracking-wider text-acorn-gold">
              {testimonial.location}
            </p>
          )}
        </div>
      </Card>
    </li>
  );
}
