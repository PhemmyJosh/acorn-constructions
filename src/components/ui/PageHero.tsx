import Image from "next/image";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  backgroundImage?: string;
}

export default function PageHero({ eyebrow, title, description, backgroundImage }: PageHeroProps) {
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
