import Link from "next/link";
import { Phone } from "lucide-react";
import { navLinks, company } from "@/data/company";
import Button from "@/components/ui/Button";
import MobileNav from "./MobileNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-950">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="text-lg font-semibold uppercase tracking-wide">
            Acorn <span className="text-amber-500">Construction</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-200 transition-colors hover:text-amber-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <a
            href={company.phoneHref}
            className="flex items-center gap-2 text-sm font-semibold text-stone-100 transition-colors hover:text-amber-400"
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
