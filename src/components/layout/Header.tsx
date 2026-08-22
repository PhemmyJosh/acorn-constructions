import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { navLinks, company } from "@/data/company";
import Button from "@/components/ui/Button";
import MobileNav from "./MobileNav";
import ServicesDropdown from "./ServicesDropdown";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-acorn-charcoal">
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

        <MobileNav />
      </div>
    </header>
  );
}
