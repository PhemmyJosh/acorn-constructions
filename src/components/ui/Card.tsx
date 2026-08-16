import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-sm border border-acorn-bronze/20 bg-white p-8 shadow-sm transition-shadow duration-[250ms] ease-in-out hover:shadow-lg motion-reduce:transition-none ${className}`}
    >
      {children}
    </div>
  );
}
