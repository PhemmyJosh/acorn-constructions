import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import { processSteps } from "@/data/howWeWork";

export default function HowWeWork() {
  return (
    <Section tone="stone">
      <SectionHeading
        eyebrow="How We Work"
        title="A clear process from scope to handover"
        description="As the framing subcontractor, we plug in once the site is ready and carry the project through to a finished, walked-through structure."
        align="center"
        className="mx-auto"
      />
      <div className="mt-16 grid gap-10 lg:grid-cols-5 lg:gap-6">
        {processSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative flex flex-col items-center gap-4 text-center">
              {index < processSteps.length - 1 ? (
                <div className="absolute left-1/2 top-7 hidden h-px w-full bg-acorn-bronze/25 lg:block" />
              ) : null}
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-acorn-charcoal text-acorn-gold">
                <Icon size={24} stroke={1.75} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-acorn-gold">
                Step {index + 1}
              </span>
              <h3 className="text-base font-semibold text-acorn-charcoal">{step.title}</h3>
              <p className="text-sm leading-relaxed text-acorn-charcoal/70">{step.description}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
