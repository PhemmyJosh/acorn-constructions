import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Section from "@/components/ui/Section";

export default function IntroBlurb() {
  return (
    <Section tone="cream">
      <div className="flex flex-col items-start gap-6 lg:max-w-3xl">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
          Who We Are
        </span>
        <h2 className="text-3xl font-semibold sm:text-4xl">
          A builder that treats your project like its own.
        </h2>
        <p className="text-base leading-relaxed text-stone-600 sm:text-lg">
          Acorn Constructions is a licensed general contractor built on a
          simple idea: do the work right, communicate honestly, and finish
          what you start. For over a decade we&apos;ve partnered with
          homeowners and business owners to plan, permit, and build projects
          of every size, backed by an in-house team of tradespeople who take
          the same care on a deck as they do on a ground-up commercial build.
        </p>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-950 transition-colors hover:text-amber-600"
        >
          About Us
          <ArrowRight size={16} />
        </Link>
      </div>
    </Section>
  );
}
