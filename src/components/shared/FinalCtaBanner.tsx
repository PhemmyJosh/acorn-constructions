import Image from "next/image";
import { Phone } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { company } from "@/data/company";
import Reveal from "@/components/motion/Reveal";
import { photos } from "@/data/photos";

interface FinalCtaBannerProps {
  /**
   * Headline override. Service detail pages pass their own per-service copy;
   * every other page uses the standard headline.
   */
  title?: string;
}

export default function FinalCtaBanner({
  title = "Ready to Start Your Build?",
}: FinalCtaBannerProps) {
  return (
    <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-acorn-charcoal text-acorn-cream">
      <Image
        src={photos.residentialFraming}
        alt="Acorn Construction framing project"
        fill
        className="object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-acorn-charcoal via-acorn-charcoal/75 to-acorn-charcoal/40" />

      <Reveal className="relative z-10 w-full">
      <Container className="flex flex-col items-center gap-6 py-24 text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-acorn-gold">
          Let&apos;s Build Something
        </span>
        <h2 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <p className="max-w-xl text-lg leading-relaxed text-acorn-cream/80">
          From first sketch to final walkthrough, our crews bring the same
          standard to every job.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href="/estimate" variant="primary" className="px-9 py-4 text-base">
            Get a Quote
          </Button>
          <a
            href={company.phoneHref}
            className="flex items-center justify-center gap-2 rounded-sm border border-acorn-cream/70 px-9 py-4 text-base font-semibold uppercase tracking-wider text-acorn-cream transition-colors duration-200 hover:bg-acorn-cream hover:text-acorn-charcoal"
          >
            <Phone size={18} />
            {company.phoneDisplay}
          </a>
        </div>
      </Container>
      </Reveal>
    </section>
  );
}
