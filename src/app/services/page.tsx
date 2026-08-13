import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import ServiceCard from "@/components/services/ServiceCard";
import FinalCta from "@/components/home/FinalCta";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Services | Acorn Construction",
  description:
    "Explore Acorn Construction's residential & light commercial framing, foundations, and post frame construction services across Alberta and Saskatchewan.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Construction services for every project"
        description="Framing, foundations, and post frame construction across Alberta and Saskatchewan, delivered with the same craftsmanship on every job."
      />

      <Section tone="light">
        {/*
          Subcontractor scope note — Acorn typically joins projects as a
          subcontractor after excavation or foundation stage to complete the
          framing scope.
        */}
        <p className="mb-10 max-w-3xl text-sm italic text-stone-500">
          Note: Acorn typically joins projects as a subcontractor after
          excavation or foundation stage to complete the framing scope.
        </p>
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
