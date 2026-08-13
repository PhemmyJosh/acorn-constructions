import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-acorn-charcoal text-acorn-gold">
        <Icon size={26} />
      </div>
      <h3 className="text-xl font-semibold text-acorn-charcoal">{service.title}</h3>
      <p className="text-sm leading-relaxed text-acorn-charcoal/70">{service.shortDescription}</p>
      <Link
        href={`/services/${service.slug}`}
        className="mt-auto inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-acorn-gold transition-colors hover:text-acorn-bronze"
      >
        Learn More
        <ArrowRight size={16} />
      </Link>
    </Card>
  );
}
