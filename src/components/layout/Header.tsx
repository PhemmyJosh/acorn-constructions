"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { navLinks, company } from "@/data/company";
import Button from "@/components/ui/Button";
import MobileNav from "./MobileNav";
import ServicesDropdown from "./ServicesDropdown";

/** How far to scroll before the nav takes on its solid background. */
const SOLID_AFTER_PX = 32;

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > SOLID_AFTER_PX);
    window.addEventListener("scroll", update, { passive: true });
    // Also run once on mount, so a page that loads already scrolled (restored
    // position, or an in-page anchor) starts with the solid bar.
    queueMicrotask(update);
    return () => window.removeEventListener("scroll", update);
  }, []);

  // An open mobile menu always gets the solid bar, so the strip above the
  // menu panel is never see-through.
  const isSolid = isScrolled || isMenuOpen;

  return (
    // Fixed rather than sticky, so the transparent state reveals the hero
    // behind the bar instead of the page background.
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ease-out ${
        isSolid ? "bg-acorn-charcoal shadow-lg shadow-acorn-charcoal/20" : "bg-transparent"
      }`}
    >
      {/* Soft top-down scrim, shown only while transparent. Guarantees the logo
          and nav text stay readable over a hero photo without the bar reading
          as solid. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-acorn-charcoal/80 via-acorn-charcoal/40 to-transparent transition-opacity duration-300 ease-out ${
          isSolid ? "opacity-0" : "opacity-100"
        }`}
      />

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 sm:px-8 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center text-acorn-cream">
          {/* Horizontal lockup already includes the wordmark. sizes keeps the
              served file near its display width rather than shipping the
              full-resolution asset. */}
          <Image
            src="/acorn-logo-horizontal.png"
            alt="Acorn Construction"
            width={4179}
            height={1513}
            priority
            sizes="160px"
            className="h-12 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navLinks.map((link) =>
            link.children ? (
              <ServicesDropdown key={link.href} label={link.label} items={link.children} />
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-acorn-cream/80 transition-colors duration-200 hover:text-acorn-gold"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 lg:flex xl:gap-6">
          <a
            href={company.phoneHref}
            className="flex items-center gap-2 text-sm font-semibold text-acorn-cream transition-colors duration-200 hover:text-acorn-gold"
          >
            <Phone size={16} />
            {company.phoneDisplay}
          </a>
          <Button href="/estimate" variant="primary" className="px-5 py-2.5 text-xs">
            Get a Free Estimate
          </Button>
        </div>

        <MobileNav onOpenChange={setIsMenuOpen} />
      </div>
    </header>
  );
}
