import { Quote } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import Reveal, { REVEAL_STAGGER } from "@/components/motion/Reveal";
import { testimonials } from "@/data/testimonials";

// TESTIMONIALS NEEDED FROM CLIENT: the quotes below are placeholder copy
// standing in until real client testimonials are provided.
export default function Testimonials() {
  return (
    <Section tone="stone">
      <Reveal>
        <SectionHeading
          eyebrow="Client Stories"
          title="What our clients say"
          align="center"
          className="mx-auto"
        />
      </Reveal>
      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal key={testimonial.name} delay={index * REVEAL_STAGGER} className="h-full">
          <Card
            className="flex h-full flex-col gap-6 border-acorn-bronze/25 bg-white shadow-md hover:shadow-xl"
          >
            <Quote className="text-acorn-gold" size={28} />
            <p className="text-base leading-relaxed text-acorn-charcoal/80">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="mt-auto border-t border-acorn-bronze/15 pt-4">
              <p className="text-sm font-semibold text-acorn-charcoal">{testimonial.name}</p>
              <p className="text-sm text-acorn-charcoal/60">{testimonial.role}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-acorn-gold">
                {testimonial.location}
              </p>
            </div>
          </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
