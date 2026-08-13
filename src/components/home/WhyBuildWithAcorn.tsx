import Image from "next/image";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { coreValues } from "@/data/coreValues";
import { photos } from "@/data/photos";

export default function WhyBuildWithAcorn() {
  const featured = coreValues.slice(0, 4);

  return (
    <Section tone="stone">
      <SectionHeading
        eyebrow="Why Build With Acorn"
        title="A crew that treats your job site like it's their own"
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
        <div className="flex flex-col gap-6 lg:relative lg:z-10 lg:-ml-16 lg:mt-12 lg:gap-8">
          {featured.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className={`flex items-start gap-4 rounded-sm border border-acorn-bronze/20 bg-white p-6 shadow-lg sm:p-7 ${
                  index % 2 === 1 ? "lg:ml-10" : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-acorn-bronze/15 text-acorn-bronze">
                  <Icon size={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-acorn-charcoal">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-acorn-charcoal/70">
                    {value.description}
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
