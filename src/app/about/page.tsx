import Image from "next/image";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import CoreValues from "@/components/shared/CoreValues";
import FinalCta from "@/components/home/FinalCta";
import { team } from "@/data/team";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "About Us | Acorn Construction",
  description:
    "The story, vision, mission, and leadership team behind Acorn Construction, a Lloydminster, Alberta builder serving Alberta and Saskatchewan since 2011.",
};

export default function AboutPage() {
  const [founder, ...restOfTeam] = team;

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Founded in 2011. Still swinging hammers."
        description={`A Lloydminster, Alberta builder serving ${company.serviceArea} with residential, light commercial, and post frame construction.`}
      />

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Our History
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              From a one-man operation to crews across two provinces
            </h2>
            <p className="text-base leading-relaxed text-stone-600">
              Acorn Construction was founded in 2011 in Lloydminster, Alberta,
              by Mark Acorn, a Red Seal journeyman carpenter who entered the
              trade in 2002 and earned his journeyman ticket in 2006. What
              began as a one-man operation building homes across Lloydminster
              has grown steadily into multiple crews working throughout
              Alberta and Saskatchewan.
            </p>
            <p className="text-base leading-relaxed text-stone-600">
              From single-family homes to our largest project to date at
              34,000 square feet, that growth has never come at the cost of
              the standard Mark set on day one: take pride in everything you
              do, and deliver a top-quality product every time, no matter the
              size of the job.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
            <Image
              src="https://placehold.co/1200x900/1c1917/e7e5e4?text=Our+History"
              alt="Acorn Construction crew on a job site"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Our Vision
            </span>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              To shape the future of construction by becoming the most
              trusted name in framing and ICF foundations, where every
              project reflects excellence, innovation, and enduring value.
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
              Our Mission
            </span>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              To build with integrity, innovate with purpose, and deliver
              exceptional construction experiences through quality
              craftsmanship, safety, and trusted partnerships.
            </h2>
          </div>
        </div>
      </Section>

      <CoreValues
        eyebrow="Core Values"
        title="What we stand for on every job"
        description="Live the values, build the company."
      />

      <Section tone="light">
        <SectionHeading
          eyebrow="Leadership"
          title="The people behind every build"
          align="center"
          className="mx-auto"
        />

        <div className="mt-14 flex flex-col gap-8 rounded-sm border border-stone-200 bg-stone-50 p-8 lg:flex-row lg:items-start lg:gap-12 lg:p-12">
          {/* Headshot is a placeholder (PLACEHOLDER_HEADSHOT) pending a real photo from the client */}
          <div className="relative aspect-[4/5] w-full max-w-xs shrink-0 overflow-hidden rounded-sm">
            <Image src={founder.image} alt={founder.name} fill className="object-cover" />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xl font-semibold text-stone-900">{founder.name}</p>
              <p className="text-sm font-medium uppercase tracking-wide text-amber-600">
                {founder.role}
              </p>
            </div>
            {founder.bio?.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-stone-600">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {restOfTeam.map((member) => (
            <div key={member.name} className="flex flex-col gap-4">
              {/* Headshot is a placeholder (PLACEHOLDER_HEADSHOT) pending a real photo from the client */}
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
