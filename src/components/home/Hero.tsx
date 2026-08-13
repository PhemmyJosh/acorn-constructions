import Image from "next/image";
import { Phone } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { company } from "@/data/company";

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-acorn-charcoal text-acorn-cream">
      <Image
        src="https://placehold.co/1920x1080/262018/745b39?text=Acorn+Construction"
        alt="Acorn Construction job site"
        fill
        priority
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-acorn-charcoal via-acorn-charcoal/70 to-acorn-charcoal/30" />

      <Container className="relative z-10 flex flex-col gap-6 py-32">
        <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-acorn-gold">
          General Contractors &middot; {company.headquarters}
          <span className="rounded-full bg-acorn-rust px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-acorn-cream">
            Since {company.founded}
          </span>
        </span>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Building Alberta &amp; Saskatchewan Since 2011
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-acorn-cream/80 sm:text-xl">
          Residential, light commercial, and post frame construction built on
          craftsmanship, safety, and trust.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href="/contact" variant="primary">
            Get a Quote
          </Button>
          {/* PLACEHOLDER — phone number needed from client */}
          <a
            href={company.phoneHref}
            className="flex items-center justify-center gap-2 rounded-sm border border-acorn-cream/70 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-acorn-cream transition-colors duration-200 hover:bg-acorn-cream hover:text-acorn-charcoal"
          >
            <Phone size={16} />
            {company.phoneDisplay}
          </a>
        </div>
      </Container>
    </section>
  );
}
