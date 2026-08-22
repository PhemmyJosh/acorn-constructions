import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import Reveal from "@/components/motion/Reveal";
import EstimateForm from "@/components/estimate/EstimateForm";
import { photos } from "@/data/photos";

export const metadata: Metadata = {
  title: "Get a Free Estimate | Acorn Construction",
  description:
    "Tell us about your residential, commercial, or post frame project and Acorn Construction will get back to you with a free, no-obligation estimate.",
};

export default function EstimatePage() {
  return (
    <>
      <PageHero
        eyebrow="Free Estimate"
        title="Get a Free Estimate"
        description="Tell us about your project and we'll get back to you with a free, no-obligation estimate."
        backgroundImage={photos.residentialFraming}
      />

      <Section tone="cream">
        <Reveal className="mx-auto w-full max-w-3xl">
          <EstimateForm />
        </Reveal>
      </Section>
    </>
  );
}
