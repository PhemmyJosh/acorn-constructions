interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="bg-acorn-charcoal py-20 text-acorn-cream sm:py-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 sm:px-8 lg:px-10">
        {eyebrow ? (
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-acorn-gold">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="max-w-2xl text-4xl font-bold sm:text-5xl">{title}</h1>
        {description ? (
          <p className="max-w-xl text-base leading-relaxed text-acorn-cream/70 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
