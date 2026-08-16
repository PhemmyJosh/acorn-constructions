"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { navLinks, company } from "@/data/company";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center text-acorn-cream"
      >
        {isOpen ? <X size={26} /> : <Menu size={26} />}
      </button>

      {isOpen ? (
        <div className="fixed inset-x-0 top-[var(--header-height,104px)] bottom-0 z-40 flex flex-col bg-acorn-charcoal px-6 py-8">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="border-b border-acorn-cream/10 py-4 text-lg font-medium text-acorn-cream"
              >
                {link.label}
              </Link>
            ))}
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
              href="/contact"
              onClick={() => setIsOpen(false)}
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
