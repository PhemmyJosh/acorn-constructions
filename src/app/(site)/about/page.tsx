import Image from "next/image";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import CoreValues from "@/components/shared/CoreValues";
import FinalCtaBanner from "@/components/shared/FinalCtaBanner";
import { team } from "@/data/team";
import { photos } from "@/data/photos";

export const metadata: Metadata = {
  title: "About Us | Acorn Construction",
  description:
    "The story, vision, mission, and leadership team behind Acorn Construction, a Lloydminster, Alberta builder since 2011.",
};

export default function AboutPage() {
  const [founder] = team;

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Founded in 2011. Still swinging hammers."
        description="A Lloydminster, Alberta builder specializing in residential, light commercial, and post frame construction."
        backgroundImage={photos.crewWithFinishedHouses}
      />

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-5">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-acorn-gold">
              Our History
            </span>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              From a one-man operation to multiple crews
            </h2>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              Acorn Construction was founded in 2011 in Lloydminster, Alberta,
              by Mark Acorn, a Red Seal journeyman carpenter who entered the
              trade in 2002 and earned his journeyman ticket in 2006. What
              began as a one-man operation building homes across Lloydminster
              has grown steadily into multiple crews working across Western
              Canada.
            </p>
            <p className="text-base leading-relaxed text-acorn-charcoal/70">
              From single-family homes to our largest project to date at{" "}
              <span className="font-semibold text-acorn-rust">
                34,000 square feet
              </span>
              , that growth has never come at the cost of the standard Mark
              set on day one: take pride in everything you do, and deliver a
              top-quality product every time, no matter the size of the job.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
            <Image
              src={photos.trussInterior}
              alt="Acorn Construction crew on a job site"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section tone="stone">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-acorn-gold">
              Our Vision
            </span>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              To shape the future of construction by becoming the most
              trusted name in framing and ICF foundations, where every
              project reflects excellence, innovation, and enduring value.
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-acorn-gold">
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

      <Section tone="stone">
        <SectionHeading
          eyebrow="Leadership"
          title="The founder behind every build"
          align="center"
          className="mx-auto"
        />

        {/* A single leadership profile, so this is a side-by-side photo and
            bio treatment rather than a card in a grid that would leave gaps. */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-14">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-sm lg:mx-0 lg:max-w-none">
            <Image
              src={founder.image ?? ""}
              alt={founder.name}
              fill
              sizes="(min-width: 1024px) 22rem, 100vw"
              className="object-cover object-top"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-2xl font-semibold text-acorn-charcoal">{founder.name}</p>
              <p className="text-sm font-medium uppercase tracking-wide text-acorn-gold">
                {founder.role}
              </p>
            </div>
            {founder.bio?.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-acorn-charcoal/70">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <FinalCtaBanner />
    </>
  );
}
