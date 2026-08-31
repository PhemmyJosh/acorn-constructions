import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { getPublishedTestimonials } from "@/lib/content-data";
import TestimonialsMarquee from "./TestimonialsMarquee";

export default async function Testimonials() {
  const testimonials = await getPublishedTestimonials();

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

      {/* The row scrolls continuously, so it is deliberately not wrapped in a
          Reveal: an entrance transform on the ancestor would fight the
          marquee's own transform. The heading above carries the entrance. */}
      <TestimonialsMarquee testimonials={testimonials} />
    </Section>
  );
}
