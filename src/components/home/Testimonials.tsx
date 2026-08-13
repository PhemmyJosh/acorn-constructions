import { Quote } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import { testimonials } from "@/data/testimonials";

// TESTIMONIALS NEEDED FROM CLIENT — the quotes below are placeholder copy
// standing in until real client testimonials are provided.
export default function Testimonials() {
  return (
    <Section tone="cream">
      <SectionHeading
        eyebrow="Client Stories"
        title="What our clients say"
        align="center"
        className="mx-auto"
      />
      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name} className="flex flex-col gap-6 bg-white">
            <Quote className="text-amber-500" size={28} />
            <p className="text-base leading-relaxed text-stone-700">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="mt-auto">
              <p className="text-sm font-semibold text-stone-900">{testimonial.name}</p>
              <p className="text-sm text-stone-500">{testimonial.role}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
