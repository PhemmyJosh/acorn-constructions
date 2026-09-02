import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import ServiceCard from "@/components/services/ServiceCard";
import FinalCtaBanner from "@/components/shared/FinalCtaBanner";
import { services } from "@/data/services";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Framing, Foundation & Post Frame Services",
  description:
    "Wood frame construction, foundations and post frame buildings from a Lloydminster, Alberta contractor serving Alberta and Saskatchewan. See how each build runs.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Construction services for every project"
        description="Framing, foundations, and post frame construction delivered with the same craftsmanship on every job."
      />

      <Section tone="cream">
        {/*
          Subcontractor scope note: Acorn typically joins projects as a
          subcontractor after excavation or foundation stage to complete the
          framing scope.
        */}
        <p className="mb-10 max-w-3xl text-sm italic text-acorn-charcoal/60">
          Note: Acorn typically joins projects as a subcontractor after
          excavation or foundation stage to complete the framing scope.
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </Section>

      <FinalCtaBanner />
    </>
  );
}
