"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface ServicesDropdownProps {
  label: string;
  items: Array<{ label: string; href: string }>;
}

export default function ServicesDropdown({ label, items }: ServicesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Closes when focus leaves the trigger and menu entirely, so tabbing past
  // the last item dismisses the dropdown.
  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (!wrapperRef.current?.contains(event.relatedTarget as Node | null)) {
      setIsOpen(false);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onBlur={handleBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-1 text-sm font-medium text-acorn-cream/80 transition-colors duration-200 hover:text-acorn-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acorn-gold"
      >
        {label}
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`transition-transform duration-200 motion-reduce:transition-none ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
            // The top padding bridges the gap to the trigger so moving the
            // pointer down into the menu never crosses a dead zone.
            className="absolute left-0 top-full z-50 pt-3"
          >
            <ul className="min-w-[16rem] overflow-hidden rounded-sm border border-acorn-cream/15 bg-acorn-charcoal py-2 shadow-xl">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-5 py-3 text-sm text-acorn-cream/80 transition-colors duration-200 hover:bg-acorn-cream/5 hover:text-acorn-gold focus-visible:bg-acorn-cream/5 focus-visible:text-acorn-gold focus-visible:outline-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
