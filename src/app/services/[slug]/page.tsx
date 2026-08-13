import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Phone } from "lucide-react";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { services, getServiceBySlug } from "@/data/services";
import { company } from "@/data/company";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return { title: "Service Not Found | Acorn Construction" };
  }

  return {
    title: `${service.title} | Acorn Construction`,
    description: service.shortDescription,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const otherServices = services.filter((item) => item.slug !== service.slug);

  return (
    <>
      <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-slate-950 text-white">
        <Image
          src={service.heroImage}
          alt={service.title}
          fill
          priority
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <Container className="relative z-10 pb-14 pt-32">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
            Our Services
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold sm:text-5xl">{service.title}</h1>
        </Container>
      </section>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="flex flex-col gap-5 lg:col-span-2">
            {service.description.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-stone-600 sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-6 rounded-sm border border-stone-200 bg-stone-50 p-8">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-stone-900">
              What&apos;s Included
            </h2>
            <ul className="flex flex-col gap-4">
              {service.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-stone-600">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <section className="bg-slate-950 py-16 text-white sm:py-20">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-2xl text-2xl font-semibold sm:text-3xl">
            {service.relatedCtaText}
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href="/contact" variant="primary">
              Get a Quote
            </Button>
            <a
              href={company.phoneHref}
              className="flex items-center justify-center gap-2 rounded-sm border border-white/70 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors duration-200 hover:bg-white hover:text-slate-950"
            >
              <Phone size={16} />
              {company.phoneDisplay}
            </a>
          </div>
        </Container>
      </section>

      <Section tone="cream">
        <h2 className="text-2xl font-semibold text-stone-900">Other Services</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {otherServices.map((other) => (
            <Link
              key={other.slug}
              href={`/services/${other.slug}`}
              className="group flex flex-col gap-2 rounded-sm border border-stone-200 bg-white p-6 transition-colors hover:border-amber-500"
            >
              <span className="text-lg font-semibold text-stone-900 group-hover:text-amber-600">
                {other.title}
              </span>
              <span className="text-sm text-stone-600">{other.shortDescription}</span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
