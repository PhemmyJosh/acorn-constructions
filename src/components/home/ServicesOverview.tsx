import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import ServiceCard from "@/components/services/ServiceCard";
import { services } from "@/data/services";

export default function ServicesOverview() {
  return (
    <Section tone="stone">
      <SectionHeading
        eyebrow="What We Do"
        title="Construction services built around your project"
        description="From a single-room remodel to a ground-up commercial build, our teams bring the same licensed, in-house capability to every job."
        align="center"
        className="mx-auto"
      />
      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
    </Section>
  );
}
