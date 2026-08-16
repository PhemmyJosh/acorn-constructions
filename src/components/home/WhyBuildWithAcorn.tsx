import { Handshake, HardHat, Maximize2, Users } from "lucide-react";
import Image from "next/image";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { photos } from "@/data/photos";

const DIFFERENTIATORS = [
  {
    icon: HardHat,
    title: "25 Years in the Trade",
    description:
      "We're led by founder Mark Acorn, a Red Seal journeyman with 25 years of hands-on framing experience.",
  },
  {
    icon: Maximize2,
    title: "34,000 Sq Ft",
    description: "We've built projects as large as 34,000 square feet, our biggest to date.",
  },
  {
    icon: Users,
    title: "Multiple Crews, Multiple Sites",
    description: "We run multiple crews across multiple job sites at the same time.",
  },
  {
    icon: Handshake,
    title: "Built to Plug Into Your Project",
    description:
      "We step in seamlessly as your subcontractor right after excavation or foundation work is complete.",
  },
];

export default function WhyBuildWithAcorn() {
  return (
    <Section tone="stone">
      <SectionHeading
        eyebrow="Why Build With Acorn"
        title="Scale, experience, and a seamless handoff"
        className="mb-14"
      />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-0">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm lg:aspect-auto">
          <Image
            src={photos.framingDetail}
            alt="Acorn crew member framing a wall on site"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-6 lg:relative lg:z-10 lg:-ml-16 lg:gap-8">
          {DIFFERENTIATORS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`flex items-start gap-4 rounded-sm border border-acorn-bronze/20 bg-white p-6 shadow-lg sm:p-7 ${
                  index % 2 === 1 ? "lg:ml-10" : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-acorn-bronze/15 text-acorn-bronze">
                  <Icon size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-acorn-charcoal">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-acorn-charcoal/70">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
