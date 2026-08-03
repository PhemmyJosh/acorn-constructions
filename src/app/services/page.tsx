import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import ServiceCard from "@/components/services/ServiceCard";
import FinalCta from "@/components/home/FinalCta";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Services | Acorn Constructions",
  description:
    "Explore Acorn Constructions' residential, commercial, and specialty construction services.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Construction services for every project"
        description="Licensed, in-house teams covering residential, commercial, and specialty construction from first sketch to final walkthrough."
      />

      <Section tone="light">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
