import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { photos } from "@/data/photos";

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-acorn-charcoal text-acorn-cream">
      <Image
        src={photos.trussInterior}
        alt="Wood frame roof structure under construction"
        fill
        priority
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-acorn-charcoal via-acorn-charcoal/70 to-acorn-charcoal/30" />

      <Container className="relative z-10 flex flex-col gap-6 py-32">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          We Bring the Same Quality to Every Single Project We Build.
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-acorn-cream/80 sm:text-xl">
          Residential, light commercial, and post frame construction built on
          craftsmanship, safety, and trust.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href="/contact" variant="primary">
            Get a Quote
          </Button>
          <Link
            href="/services"
            className="flex items-center justify-center rounded-sm border border-acorn-cream/70 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-acorn-cream transition-colors duration-200 hover:bg-acorn-cream hover:text-acorn-charcoal"
          >
            See Our Services
          </Link>
        </div>
      </Container>
    </section>
  );
}
