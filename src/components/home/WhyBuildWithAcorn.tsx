import { Handshake, Users } from "lucide-react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";

export default function WhyBuildWithAcorn() {
  return (
    <Section tone="stone">
      <SectionHeading
        eyebrow="Why Build With Acorn"
        title="Scale, experience, and a seamless handoff"
        description="Four things that set our crews apart on every job site."
        align="center"
        className="mx-auto mb-14"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex min-h-[260px] flex-col justify-between rounded-sm bg-acorn-charcoal p-8 sm:p-10">
          <span className="text-5xl font-bold text-acorn-gold sm:text-6xl">34,000 sq ft</span>
          <div className="mt-6 flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-acorn-cream">Largest Project to Date</h3>
            <p className="text-sm leading-relaxed text-acorn-cream/70">
              From single-family homes to our biggest builds yet, one crew
              standard scales to fit the job.
            </p>
          </div>
        </div>

        <div className="flex min-h-[260px] flex-col gap-4 rounded-sm border border-acorn-bronze/20 bg-white p-8 sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acorn-bronze/15 text-acorn-bronze">
            <Users size={22} />
          </div>
          <h3 className="text-lg font-semibold text-acorn-charcoal">
            Multiple Crews, Multiple Sites
          </h3>
          <p className="text-sm leading-relaxed text-acorn-charcoal/70">
            We run several crews at once, so your project timeline doesn&apos;t
            wait on someone else&apos;s.
          </p>
        </div>

        <div className="flex min-h-[260px] flex-col gap-4 rounded-sm border border-acorn-bronze/20 bg-white p-8 sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acorn-bronze/15 text-acorn-bronze">
            <Handshake size={22} />
          </div>
          <h3 className="text-lg font-semibold text-acorn-charcoal">
            Built to Plug Into Your Project
          </h3>
          <p className="text-sm leading-relaxed text-acorn-charcoal/70">
            We join after excavation or foundation stage and coordinate
            directly with your general contractor for a seamless handoff.
          </p>
        </div>

        <div className="flex min-h-[260px] flex-col justify-between rounded-sm bg-acorn-charcoal p-8 sm:p-10">
          <span className="text-5xl font-bold text-acorn-gold sm:text-6xl">25 Years</span>
          <div className="mt-6 flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-acorn-cream">
              Hands-On Framing Experience
            </h3>
            <p className="text-sm leading-relaxed text-acorn-cream/70">
              Founder-led by a Red Seal journeyman carpenter who still shows
              up on site.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
