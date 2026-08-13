import { ReactNode } from "react";
import Container from "./Container";

type SectionTone = "cream" | "stone" | "dark";

interface SectionProps {
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
  id?: string;
  containerClassName?: string;
}

const toneClasses: Record<SectionTone, string> = {
  cream: "bg-acorn-cream text-acorn-charcoal",
  stone: "bg-acorn-stone text-acorn-charcoal",
  dark: "bg-acorn-charcoal text-acorn-cream",
};

export default function Section({
  children,
  className = "",
  tone = "cream",
  id,
  containerClassName = "",
}: SectionProps) {
  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-28 ${toneClasses[tone]} ${className}`}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
