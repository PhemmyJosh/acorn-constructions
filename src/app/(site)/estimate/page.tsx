import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import Reveal from "@/components/motion/Reveal";
import EstimateForm from "@/components/estimate/EstimateForm";
import { photos } from "@/data/photos";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Free Construction Estimate",
  description:
    "Tell Acorn Construction about your framing, foundation or post frame build in Alberta or Saskatchewan and get a free, no-obligation estimate back from the crew.",
  path: "/estimate",
});

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
