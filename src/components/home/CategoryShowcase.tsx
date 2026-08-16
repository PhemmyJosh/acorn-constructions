import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal, { REVEAL_STAGGER } from "@/components/motion/Reveal";
import { services } from "@/data/services";

export default function CategoryShowcase() {
  return (
    <Section tone="cream">
      <Reveal>
        <SectionHeading
          eyebrow="What We Build"
          title="Built for Every Project"
          description="Three core disciplines, one crew standard: precise, safe, and finished right."
          align="center"
          className="mx-auto"
        />
      </Reveal>
      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {services.map((service, index) => (
          <Reveal key={service.slug} delay={index * REVEAL_STAGGER}>
            <Link
              href={`/services/${service.slug}`}
              className="group relative block aspect-[3/4] w-full overflow-hidden rounded-sm"
            >
            <Image
              src={service.heroImage}
              alt={service.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-acorn-charcoal via-acorn-charcoal/50 to-acorn-charcoal/10" />
            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-7 sm:p-8">
              <h3 className="text-2xl font-semibold text-acorn-cream sm:text-[1.75rem]">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-acorn-cream/80">
                {service.shortDescription}
              </p>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-acorn-gold transition-colors group-hover:text-acorn-cream">
                Learn More
                <ArrowRight size={16} />
              </span>
            </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
