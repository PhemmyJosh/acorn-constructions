"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, Phone } from "lucide-react";
import { navLinks, company } from "@/data/company";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  function closeMenu() {
    setIsOpen(false);
    setExpanded(null);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="-mr-2 flex h-11 w-11 items-center justify-center text-acorn-cream"
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {isOpen ? (
        <div className="fixed inset-x-0 top-[var(--header-height,104px)] bottom-0 z-40 flex flex-col overflow-y-auto bg-acorn-charcoal px-6 py-8">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              if (!link.children) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="border-b border-acorn-cream/10 py-4 text-lg font-medium text-acorn-cream"
                  >
                    {link.label}
                  </Link>
                );
              }

              const isExpanded = expanded === link.href;
              return (
                <div key={link.href} className="border-b border-acorn-cream/10">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpanded(isExpanded ? null : link.href)}
                    className="flex w-full items-center justify-between py-4 text-left text-lg font-medium text-acorn-cream"
                  >
                    {link.label}
                    <ChevronDown
                      size={20}
                      aria-hidden="true"
                      className={`transition-transform duration-200 motion-reduce:transition-none ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Expands instantly rather than via a height animation:
                      nav links should never depend on an animation resolving
                      to become visible. The chevron rotation carries the
                      affordance. */}
                  {isExpanded ? (
                    <ul className="flex flex-col pb-2 pl-4">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={closeMenu}
                            className="block border-l border-acorn-gold/30 py-3 pl-4 text-base text-acorn-cream/70"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="mt-8 flex flex-col gap-4">
            <a
              href={company.phoneHref}
              className="flex items-center gap-2 text-lg font-semibold text-acorn-gold"
            >
              <Phone size={18} />
              {company.phoneDisplay}
            </a>
            <Link
              href="/estimate"
              onClick={closeMenu}
              className="inline-flex items-center justify-center rounded-sm bg-acorn-gold px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-acorn-charcoal transition hover:brightness-90"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
