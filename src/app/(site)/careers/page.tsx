import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal, { REVEAL_STAGGER } from "@/components/motion/Reveal";
import ApplicationForm from "@/components/careers/ApplicationForm";
import { whyWorkWithUs } from "@/data/careers";
import { photos } from "@/data/photos";

export const metadata: Metadata = {
  title: "Careers | Acorn Construction",
  description:
    "Join the Acorn Construction crew. We're hiring skilled, safety-first tradespeople for residential, light commercial, and post frame projects.",
};

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        // Each sentence is its own block so the headline always breaks
        // between the two sentences rather than wherever it happens to fit.
        title={
          <>
            <span className="block">Build More Than Structures.</span>
            <span className="block">Build Your Career With Us.</span>
          </>
        }
        // Fluid size so each sentence holds a single line at every width,
        // keeping the headline to exactly two lines down to small phones.
        titleClassName="max-w-none text-[clamp(1.375rem,6.2vw,3rem)] leading-tight"
        description="At Acorn Construction, we're more than a framing company. We're a team of skilled, safety-first tradespeople dedicated to precision and quality on every job. Join our growing crew and help us build across Alberta and Saskatchewan while growing your own skills and career."
        backgroundImage={photos.crewBuildingByLake}
      />

      <Section tone="cream">
        <Reveal>
          <SectionHeading
            eyebrow="Why Work With Us"
            title="A crew worth being part of"
            align="center"
            className="mx-auto"
          />
        </Reveal>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {whyWorkWithUs.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.title}
                delay={index * REVEAL_STAGGER}
                className="flex h-full flex-col gap-4 rounded-sm border border-acorn-bronze/20 bg-white p-7 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acorn-gold text-acorn-charcoal">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-acorn-charcoal">{item.title}</h3>
                <p className="text-sm leading-relaxed text-acorn-charcoal/70">
                  {item.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section tone="stone">
        <Reveal>
          <SectionHeading
            eyebrow="Join The Crew"
            title="Apply Now"
            description="Tell us about your experience and what you're proficient in. We'll get back to you if there's a fit on one of our crews."
            align="center"
            className="mx-auto"
          />
        </Reveal>
        <Reveal className="mx-auto mt-14 w-full max-w-3xl">
          <ApplicationForm />
        </Reveal>
      </Section>
    </>
  );
}
