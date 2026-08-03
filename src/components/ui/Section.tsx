import { ReactNode } from "react";
import Container from "./Container";

type SectionTone = "light" | "dark" | "cream";

interface SectionProps {
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
  id?: string;
  containerClassName?: string;
}

const toneClasses: Record<SectionTone, string> = {
  light: "bg-white text-stone-900",
  dark: "bg-slate-950 text-stone-50",
  cream: "bg-stone-50 text-stone-900",
};

export default function Section({
  children,
  className = "",
  tone = "light",
  id,
  containerClassName = "",
}: SectionProps) {
  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-28 ${toneClasses[tone]} ${className}`}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
