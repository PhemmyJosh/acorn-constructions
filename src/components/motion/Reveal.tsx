"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export const REVEAL_DURATION = 0.55;
export const REVEAL_STAGGER = 0.09;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before starting. Use index * REVEAL_STAGGER for grids. */
  delay?: number;
  /** Distance in px the element travels upward as it fades in. */
  y?: number;
}

/**
 * Fades and slides content up as it scrolls into view, once per element.
 *
 * This is the single place prefers-reduced-motion is handled for scroll
 * reveals: when the user asks for reduced motion, `initial={false}` makes the
 * element render in its final state with no transition at all. The same
 * element is rendered either way so hydration stays consistent.
 */
export default function Reveal({ children, className, delay = 0, y = 20 }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: REVEAL_DURATION, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
