import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { navLinks, company } from "@/data/company";
import Container from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon } from "@/components/ui/SocialIcons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-acorn-charcoal text-acorn-cream/70">
      <Container className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <Link href="/" className="w-fit">
            <Image
              src="/acorn-logo-white.png"
              alt="Acorn Construction, since 2011"
              width={158}
              height={180}
              className="h-[140px] w-auto"
            />
          </Link>
          <p className="text-sm leading-relaxed text-acorn-cream/60">
            &ldquo;{company.tagline}&rdquo;
          </p>
          <p className="text-sm font-medium text-acorn-cream/80">{company.serviceAreaLine}</p>
          <div className="flex items-center gap-4 pt-2">
            <a
              href={company.social.facebook}
              aria-label="Acorn Construction on Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-acorn-cream/20 text-acorn-cream/70 transition-colors hover:border-acorn-gold hover:text-acorn-gold"
            >
              <FacebookIcon size={16} />
            </a>
            <a
              href={company.social.instagram}
              aria-label="Acorn Construction on Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-acorn-cream/20 text-acorn-cream/70 transition-colors hover:border-acorn-gold hover:text-acorn-gold"
            >
              <InstagramIcon size={16} />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-acorn-cream">Navigate</h3>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-acorn-cream/60 transition-colors hover:text-acorn-gold"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-acorn-cream">Services</h3>
          <Link href="/services/residential-light-commercial-framing" className="text-sm text-acorn-cream/60 transition-colors hover:text-acorn-gold">
            Residential &amp; Light Commercial Framing
          </Link>
          <Link href="/services/foundations" className="text-sm text-acorn-cream/60 transition-colors hover:text-acorn-gold">
            Foundations
          </Link>
          <Link href="/services/post-frame-construction" className="text-sm text-acorn-cream/60 transition-colors hover:text-acorn-gold">
            Post Frame Construction
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-acorn-cream">Contact</h3>
          {/* PLACEHOLDER — full street address needed from client */}
          <div className="flex items-start gap-2 text-sm text-acorn-cream/60">
            <MapPin size={16} className="mt-0.5 shrink-0 text-acorn-gold" />
            <span>
              {company.address.line1}
              <br />
              {company.address.cityStateZip}
            </span>
          </div>
          {/* PLACEHOLDER — phone number needed from client */}
          <a
            href={company.phoneHref}
            className="flex items-center gap-2 text-sm text-acorn-cream/60 transition-colors hover:text-acorn-gold"
          >
            <Phone size={16} className="shrink-0 text-acorn-gold" />
            {company.phoneDisplay}
          </a>
          {/* PLACEHOLDER — email needed from client */}
          <a
            href={`mailto:${company.email}`}
            className="flex items-center gap-2 text-sm text-acorn-cream/60 transition-colors hover:text-acorn-gold"
          >
            <Mail size={16} className="shrink-0 text-acorn-gold" />
            {company.email}
          </a>
        </div>
      </Container>

      <div className="border-t border-acorn-cream/10 py-6">
        <Container>
          <p className="text-center text-xs text-acorn-cream/50">
            &copy; {year} {company.legalName}. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
