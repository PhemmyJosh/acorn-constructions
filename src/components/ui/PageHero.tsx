import Image from "next/image";
import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?: string;
  /** Accepts nodes so a page can control its own line breaks. */
  title: ReactNode;
  description?: string;
  backgroundImage?: string;
  /**
   * Replaces the h1's width and type-size classes. Override when a longer
   * headline needs to hold a specific line count at small widths.
   */
  titleClassName?: string;
}

export default function PageHero({
  eyebrow,
  title,
  description,
  backgroundImage,
  titleClassName = "max-w-2xl text-4xl sm:text-5xl",
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-acorn-charcoal py-20 text-acorn-cream sm:py-24">
      {backgroundImage ? (
        <>
          <Image src={backgroundImage} alt="" fill priority className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-acorn-charcoal via-acorn-charcoal/70 to-acorn-charcoal/50" />
        </>
      ) : null}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 sm:px-8 lg:px-10">
        {eyebrow ? (
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-acorn-gold">
            {eyebrow}
          </span>
        ) : null}
        <h1 className={`font-bold ${titleClassName}`}>{title}</h1>
        {description ? (
          <p className="max-w-xl text-base leading-relaxed text-acorn-cream/70 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
