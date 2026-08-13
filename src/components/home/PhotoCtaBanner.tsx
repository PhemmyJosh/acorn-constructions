import Image from "next/image";
import { Phone } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { company } from "@/data/company";
import { photos } from "@/data/photos";

export default function PhotoCtaBanner() {
  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-acorn-charcoal text-acorn-cream">
      <Image
        src={photos.residentialFraming}
        alt="Acorn Construction framing project"
        fill
        className="object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-acorn-charcoal via-acorn-charcoal/75 to-acorn-charcoal/40" />

      <Container className="relative z-10 flex flex-col items-center gap-6 py-24 text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-acorn-gold">
          Let&apos;s Build Something
        </span>
        <h2 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Ready to Start Your Build?
        </h2>
        <p className="max-w-xl text-lg leading-relaxed text-acorn-cream/80">
          From first sketch to final walkthrough, our crews bring the same
          standard to every job across Alberta and Saskatchewan.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href="/contact" variant="primary" className="px-9 py-4 text-base">
            Get a Quote
          </Button>
          {/* PLACEHOLDER — phone number needed from client */}
          <a
            href={company.phoneHref}
            className="flex items-center justify-center gap-2 rounded-sm border border-acorn-cream/70 px-9 py-4 text-base font-semibold uppercase tracking-wider text-acorn-cream transition-colors duration-200 hover:bg-acorn-cream hover:text-acorn-charcoal"
          >
            <Phone size={18} />
            {company.phoneDisplay}
          </a>
        </div>
      </Container>
    </section>
  );
}
