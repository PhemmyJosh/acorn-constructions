import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Section from "@/components/ui/Section";
import { photos } from "@/data/photos";

export default function IntroBlurb() {
  return (
    <Section tone="cream">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-acorn-gold">
            Who We Are
          </span>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            From a one-man operation to multiple crews
          </h2>
          <p className="text-base leading-relaxed text-acorn-charcoal/70 sm:text-lg">
            Founded in 2011 by Mark Acorn, a Red Seal journeyman carpenter with
            over two decades of wood frame construction experience, Acorn
            Construction has grown from a one-man operation into multiple
            crews. From single-family homes to our largest project to date at
            34,000 square feet, we bring the same level of quality and
            attention to detail to every job.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-acorn-charcoal transition-colors hover:text-acorn-gold"
          >
            Learn More
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="relative order-first aspect-[4/3] w-full overflow-hidden rounded-sm lg:order-last">
          <Image
            src={photos.crewOnTrusses}
            alt="Acorn crew member working on roof trusses"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </Section>
  );
}
