import { ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-acorn-gold text-acorn-charcoal hover:brightness-90 focus-visible:outline-acorn-gold",
  secondary:
    "bg-transparent text-acorn-charcoal border border-acorn-charcoal hover:bg-acorn-charcoal hover:text-acorn-cream focus-visible:outline-acorn-charcoal",
  ghost:
    "bg-transparent text-acorn-charcoal border border-acorn-charcoal/30 hover:border-acorn-charcoal focus-visible:outline-acorn-charcoal",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-sm px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
