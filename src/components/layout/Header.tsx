import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { navLinks, company } from "@/data/company";
import Button from "@/components/ui/Button";
import MobileNav from "./MobileNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-acorn-charcoal">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center text-acorn-cream">
          <Image
            src="/acorn-logo-white.png"
            alt="Acorn Construction, since 2011"
            width={158}
            height={180}
            priority
            className="h-20 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-acorn-cream/80 transition-colors hover:text-acorn-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <a
            href={company.phoneHref}
            className="flex items-center gap-2 text-sm font-semibold text-acorn-cream transition-colors hover:text-acorn-gold"
          >
            <Phone size={16} />
            {company.phoneDisplay}
          </a>
          <Button href="/contact" variant="primary" className="px-5 py-2.5 text-xs">
            Get a Quote
          </Button>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
