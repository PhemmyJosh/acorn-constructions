import Image from "next/image";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import FinalCta from "@/components/home/FinalCta";
import { team } from "@/data/team";

export const metadata: Metadata = {
  title: "About Us | Acorn Constructions",
  description:
    "Learn about Acorn Constructions' story, mission, and the team behind our residential and commercial builds.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="A decade of building things that last"
        description="Acorn Constructions started with a single crew and a simple standard: build it like it's your own. That standard hasn't changed."
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Our Story
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              From a single crew to a full-service builder
            </h2>
            <p className="text-base leading-relaxed text-stone-600">
              Acorn Constructions was founded on the belief that construction
              should be a partnership, not a transaction. What began as a
              small residential crew has grown into a full-service general
              contractor, built one referral and one finished project at a
              time.
            </p>
            <p className="text-base leading-relaxed text-stone-600">
              Today our team handles everything from custom homes to
              multi-phase commercial builds, but the way we operate hasn&apos;t
              changed: licensed tradespeople, honest estimates, and a project
              manager who picks up the phone.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
            <Image
              src="https://placehold.co/1200x900/1c1917/e7e5e4?text=Our+Story"
              alt="Acorn Constructions crew on a job site"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative order-last aspect-[4/3] w-full overflow-hidden rounded-sm lg:order-first">
            <Image
              src="https://placehold.co/1200x900/1c1917/e7e5e4?text=Our+Mission"
              alt="Acorn Constructions team reviewing blueprints"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Our Mission
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Build with integrity, deliver without excuses
            </h2>
            <p className="text-base leading-relaxed text-stone-600">
              Our mission is to deliver every project on time, on budget, and
              to a standard we&apos;d be proud to put our name on. That means
              transparent pricing before we break ground, clear communication
              while we build, and a finished product that holds up long after
              the crew has moved on.
            </p>
            <p className="text-base leading-relaxed text-stone-600">
              We measure success by the number of clients who call us back
              for the next project, not just the one in front of us.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="light">
        <SectionHeading
          eyebrow="Our Team"
          title="The people behind every build"
          description="A small leadership team keeps every project accountable, backed by licensed tradespeople in every discipline."
          align="center"
          className="mx-auto"
        />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="flex flex-col gap-4">
              <div className="relative aspect-[5/6] w-full overflow-hidden rounded-sm">
                <Image src={member.image} alt={member.name} fill className="object-cover" />
              </div>
              <div>
                <p className="text-base font-semibold text-stone-900">{member.name}</p>
                <p className="text-sm text-stone-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
