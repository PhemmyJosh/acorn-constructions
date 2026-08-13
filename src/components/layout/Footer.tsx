import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { navLinks, company } from "@/data/company";
import Container from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon } from "@/components/ui/SocialIcons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-stone-300">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <Link href="/" className="text-lg font-semibold uppercase tracking-wide text-white">
            Acorn <span className="text-amber-500">Construction</span>
          </Link>
          <p className="text-sm leading-relaxed text-stone-400">
            &ldquo;{company.tagline}&rdquo;
          </p>
          <p className="text-sm font-medium text-stone-300">{company.serviceAreaLine}</p>
          <div className="flex items-center gap-4 pt-2">
            <a
              href={company.social.facebook}
              aria-label="Acorn Construction on Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-stone-300 transition-colors hover:border-amber-500 hover:text-amber-400"
            >
              <FacebookIcon size={16} />
            </a>
            <a
              href={company.social.instagram}
              aria-label="Acorn Construction on Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-stone-300 transition-colors hover:border-amber-500 hover:text-amber-400"
            >
              <InstagramIcon size={16} />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Navigate</h3>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-stone-400 transition-colors hover:text-amber-400"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Services</h3>
          <Link href="/services/residential-light-commercial-framing" className="text-sm text-stone-400 transition-colors hover:text-amber-400">
            Residential &amp; Light Commercial Framing
          </Link>
          <Link href="/services/foundations" className="text-sm text-stone-400 transition-colors hover:text-amber-400">
            Foundations
          </Link>
          <Link href="/services/post-frame-construction" className="text-sm text-stone-400 transition-colors hover:text-amber-400">
            Post Frame Construction
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
          {/* PLACEHOLDER — full street address needed from client */}
          <div className="flex items-start gap-2 text-sm text-stone-400">
            <MapPin size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <span>
              {company.address.line1}
              <br />
              {company.address.cityStateZip}
            </span>
          </div>
          {/* PLACEHOLDER — phone number needed from client */}
          <a
            href={company.phoneHref}
            className="flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-amber-400"
          >
            <Phone size={16} className="shrink-0 text-amber-500" />
            {company.phoneDisplay}
          </a>
          {/* PLACEHOLDER — email needed from client */}
          <a
            href={`mailto:${company.email}`}
            className="flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-amber-400"
          >
            <Mail size={16} className="shrink-0 text-amber-500" />
            {company.email}
          </a>
        </div>
      </Container>

      <div className="border-t border-white/10 py-6">
        <Container>
          <p className="text-center text-xs text-stone-500">
            &copy; {year} {company.legalName}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
