import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { coreValues } from "@/data/coreValues";

interface CoreValuesProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

export default function CoreValues({
  eyebrow = "Our Core Values",
  title = "Live the values, build the company",
  description,
}: CoreValuesProps) {
  return (
    <Section tone="dark">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        tone="dark"
        align="center"
        className="mx-auto"
      />
      <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {coreValues.map((value) => {
          const Icon = value.icon;
          return (
            <div key={value.title} className="flex flex-col items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acorn-bronze/20 text-acorn-bronze">
                <Icon size={22} />
              </div>
              <h3 className="text-lg font-semibold text-acorn-cream">{value.title}</h3>
              <p className="text-sm leading-relaxed text-acorn-cream/60">{value.description}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
