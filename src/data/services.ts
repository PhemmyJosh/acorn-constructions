import { Hammer, Layers, Warehouse } from "lucide-react";
import { Service } from "@/types";
import { photos } from "@/data/photos";

export const services: Service[] = [
  {
    slug: "residential-light-commercial-framing",
    title: "Residential & Light Commercial Wood Frame Construction",
    navLabel: "Residential & Commercial Framing",
    shortDescription:
      "Precise framing for custom homes, additions, garages, and light commercial buildings, built with real craftsmanship.",
    description: [
      "We provide professional wood frame construction services for residential homes and light commercial buildings. From custom homes and additions to garages, shops, and small commercial structures, our team delivers precision framing, structural integrity, and quality workmanship at every stage of construction.",
    ],
    icon: Hammer,
    heroImage: photos.residentialFraming,
    heroImageAlt:
      "Carpenters framing the wood structure of a new two-storey house on a clear day",
    seoTitle: "Wood Frame Construction in Lloydminster, AB",
    seoDescription:
      "Precision framing for custom homes, additions, garages and light commercial buildings across Alberta and Saskatchewan, from Acorn Construction in Lloydminster.",
    benefits: [
      "Custom home framing",
      "Multi-family residential framing",
      "Garages and detached structures",
      "Additions and renovations",
      "Light commercial framing",
      "Structural framing and roof systems",
    ],
    relatedCtaText: "Planning a new build, addition, or light commercial project?",
  },
  {
    slug: "foundations",
    title: "Foundations",
    navLabel: "Foundations",
    shortDescription:
      "Excavation, footings, foundation walls, and slab-on-grade work engineered for strength and long-term structural performance.",
    description: [
      "A strong building starts with a solid foundation. We provide foundation construction services that create stable, durable bases for residential and light commercial projects. Our team focuses on accuracy, proper preparation, and quality concrete work to ensure long-term structural performance.",
    ],
    icon: Layers,
    heroImage: photos.foundations,
    heroImageAlt:
      "Freshly poured concrete foundation wall with formwork still in place on a build site",
    seoTitle: "Foundations & Concrete Work in Alberta",
    seoDescription:
      "Excavation, footings, foundation walls and slab-on-grade work engineered for Prairie ground conditions. Serving Lloydminster, Alberta and Saskatchewan.",
    benefits: [
      "Excavation and site preparation",
      "Concrete footings",
      "Foundation walls",
      "Slab-on-grade foundations",
      "Foundation forming and reinforcement",
      "New foundation construction",
    ],
    relatedCtaText: "Ready to break ground on a new foundation?",
  },
  {
    slug: "post-frame-construction",
    title: "Post Frame Construction",
    navLabel: "Post Frame Construction",
    shortDescription:
      "Agricultural buildings, workshops, storage buildings, and custom post frame structures built for durability and efficiency.",
    description: [
      "Post frame construction is a versatile and cost-effective building solution for agricultural, residential, commercial, and storage applications. Whether you need a shop, barn, garage, warehouse, or custom post frame building, we deliver structures designed for strength, functionality, and efficiency.",
    ],
    icon: Warehouse,
    heroImage: photos.postFrame,
    heroImageAlt:
      "Post frame shop building with a corrugated metal roof standing on open prairie",
    seoTitle: "Post Frame Buildings & Shops in Alberta",
    seoDescription:
      "Agricultural buildings, shops and storage built post frame for durability and value. Acorn Construction serves Lloydminster and across Alberta and Saskatchewan.",
    benefits: [
      "Agricultural buildings",
      "Workshops and shops",
      "Equipment and storage buildings",
      "Detached garages",
      "Commercial post frame structures",
      "Custom post frame projects",
    ],
    relatedCtaText: "Have a shop, barn, or storage building in mind?",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
