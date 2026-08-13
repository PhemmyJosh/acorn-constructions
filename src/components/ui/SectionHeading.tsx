interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  className = "",
}: SectionHeadingProps) {
  const alignClasses = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const mutedText = tone === "dark" ? "text-acorn-cream/70" : "text-acorn-charcoal/70";
  const eyebrowColor = "text-acorn-gold";

  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignClasses} ${className}`}>
      {eyebrow ? (
        <span className={`text-sm font-semibold uppercase tracking-[0.2em] ${eyebrowColor}`}>
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">{title}</h2>
      {description ? (
        <p className={`text-base leading-relaxed sm:text-lg ${mutedText}`}>{description}</p>
      ) : null}
    </div>
  );
}
