import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import Section from "@/components/ui/Section";
import Container from "@/components/ui/Container";
import FinalCtaBanner from "@/components/shared/FinalCtaBanner";
import { services, getServiceBySlug } from "@/data/services";

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
      <section className="relative flex min-h-[50vh] items-end overflow-hidden bg-acorn-charcoal text-acorn-cream">
        <Image
          src={service.heroImage}
          alt={service.title}
          fill
          priority
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-acorn-charcoal via-acorn-charcoal/60 to-transparent" />
        <Container className="relative z-10 pb-14 pt-32">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-acorn-gold">
            Our Services
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold sm:text-5xl">{service.title}</h1>
        </Container>
      </section>

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
          <div className="flex flex-col gap-5 lg:col-span-2">
            {service.description.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-acorn-charcoal/70 sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-6 rounded-sm border border-acorn-bronze/20 bg-white p-8">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-acorn-charcoal">
              What&apos;s Included
            </h2>
            <ul className="flex flex-col gap-4">
              {service.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-acorn-charcoal/70">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-acorn-gold" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="stone">
        <h2 className="text-2xl font-semibold text-acorn-charcoal">Other Services</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {otherServices.map((other) => (
            <Link
              key={other.slug}
              href={`/services/${other.slug}`}
              className="group flex flex-col gap-2 rounded-sm border border-acorn-bronze/20 bg-white p-6 transition-colors hover:border-acorn-gold"
            >
              <span className="text-lg font-semibold text-acorn-charcoal group-hover:text-acorn-gold">
                {other.title}
              </span>
              <span className="text-sm text-acorn-charcoal/70">{other.shortDescription}</span>
            </Link>
          ))}
        </div>
      </Section>

      <FinalCtaBanner title={service.relatedCtaText} />
    </>
  );
}
