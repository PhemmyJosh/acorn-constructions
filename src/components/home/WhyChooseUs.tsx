import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { valueProps } from "@/data/valueProps";

export default function WhyChooseUs() {
  return (
    <Section tone="dark">
      <SectionHeading
        eyebrow="Why Choose Us"
        title="Built on trust, delivered with precision"
        tone="dark"
        align="center"
        className="mx-auto"
      />
      <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map((value) => {
          const Icon = value.icon;
          return (
            <div key={value.title} className="flex flex-col items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600/15 text-amber-400">
                <Icon size={22} />
              </div>
              <h3 className="text-lg font-semibold text-white">{value.title}</h3>
              <p className="text-sm leading-relaxed text-stone-400">{value.description}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
