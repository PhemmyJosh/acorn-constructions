import Link from "next/link";
import { Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import { company } from "@/data/company";

export default function FinalCta() {
  return (
    <section className="bg-acorn-gold py-16 text-acorn-charcoal sm:py-20">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
          Ready to Build Your Vision?
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-acorn-charcoal/80 sm:text-lg">
          &ldquo;{company.tagline}&rdquo;
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-sm border border-acorn-charcoal bg-acorn-charcoal px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-acorn-cream transition-colors duration-200 hover:bg-transparent hover:text-acorn-charcoal"
          >
            Get a Quote
          </Link>
          <a
            href={company.phoneHref}
            className="flex items-center justify-center gap-2 text-lg font-semibold text-acorn-charcoal"
          >
            <Phone size={18} />
            {company.phoneDisplay}
          </a>
        </div>
      </Container>
    </section>
  );
}
