import Link from "next/link";
import { Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import { company } from "@/data/company";

export default function FinalCta() {
  return (
    <section className="bg-amber-600 py-16 text-white sm:py-20">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl">
          Ready to Build Your Vision?
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-amber-50 sm:text-lg">
          Tell us about your project and we&apos;ll follow up with a clear,
          no-pressure estimate.
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-sm border border-white bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-amber-700 transition-colors duration-200 hover:bg-amber-50"
          >
            Get a Quote
          </Link>
          <a
            href={company.phoneHref}
            className="flex items-center justify-center gap-2 text-lg font-semibold text-white"
          >
            <Phone size={18} />
            {company.phoneDisplay}
          </a>
        </div>
      </Container>
    </section>
  );
}
