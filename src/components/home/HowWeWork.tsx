import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import { processSteps, type ProcessStep } from "@/data/howWeWork";

function StepMarker({ step }: { step: ProcessStep }) {
  const Icon = step.icon;
  return (
    // The ring is painted in the section's own background colour so the
    // connecting spine appears to break cleanly around each marker.
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-acorn-gold text-acorn-charcoal ring-8 ring-acorn-charcoal">
      <Icon size={24} stroke={1.75} />
    </div>
  );
}

function StepBody({ step, index }: { step: ProcessStep; index: number }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-heading text-5xl font-bold leading-none text-acorn-gold/35">
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3 className="text-base font-semibold text-acorn-cream">{step.title}</h3>
      <p className="text-sm leading-relaxed text-acorn-cream/60">{step.description}</p>
    </div>
  );
}

export default function HowWeWork() {
  return (
    <Section tone="dark">
      <Reveal>
        <SectionHeading
          eyebrow="How We Work"
          title="A clear process from scope to handover"
          description="As the framing subcontractor, we plug in once the site is ready and carry the project through to a finished, walked-through structure."
          tone="dark"
          align="center"
          className="mx-auto"
        />
      </Reveal>

      {/* Desktop: horizontal spine with steps alternating above and below it.
          The timeline reveals as one unit rather than per-step, so the markers
          never drift off the spine mid-animation. */}
      <Reveal className="relative mt-20 hidden lg:block">
        {/* Column centres sit at 10%, 30%, 50%, 70% and 90%, so the spine
            spans exactly from the first marker to the last. */}
        <div className="absolute left-[10%] right-[10%] top-1/2 h-px -translate-y-1/2 bg-acorn-gold/25" />
        <ol className="relative grid grid-cols-5 gap-6">
          {processSteps.map((step, index) => {
            const isAbove = index % 2 === 0;
            return (
              <li key={step.title} className="grid grid-rows-[1fr_auto_1fr] gap-4">
                {isAbove ? (
                  <div className="row-start-1 flex items-end">
                    <StepBody step={step} index={index} />
                  </div>
                ) : null}
                <div className="row-start-2 flex justify-center">
                  <StepMarker step={step} />
                </div>
                {!isAbove ? (
                  <div className="row-start-3 flex items-start">
                    <StepBody step={step} index={index} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </Reveal>

      {/* Mobile and tablet: vertical spine with steps stacked down the page */}
      <Reveal className="relative mt-14 lg:hidden">
        <div className="absolute bottom-0 left-7 top-0 w-px bg-acorn-gold/25" />
        <ol className="relative flex flex-col gap-10">
          {processSteps.map((step, index) => (
            <li key={step.title} className="flex gap-5 sm:gap-6">
              <div className="shrink-0">
                <StepMarker step={step} />
              </div>
              <div className="min-w-0 pt-1">
                <StepBody step={step} index={index} />
              </div>
            </li>
          ))}
        </ol>
      </Reveal>
    </Section>
  );
}
