import { Building2, Home, Wrench } from "lucide-react";
import { Service } from "@/types";

export const services: Service[] = [
  {
    slug: "residential-construction",
    title: "Residential Construction",
    shortDescription:
      "Custom homes, additions, and full-scale renovations built around how you actually live.",
    description: [
      "From the first sketch to the final walkthrough, our residential team partners with homeowners to design and build spaces that fit real life. Whether you're starting from a bare lot or reimagining a home you already love, we manage every phase in-house so nothing gets lost between the drafting table and the job site.",
      "We work in wood, stone, and steel with the same attention to detail, pairing modern building science with craftsmanship that's meant to last for generations.",
    ],
    icon: Home,
    heroImage: "https://placehold.co/1600x900/1c1917/e7e5e4?text=Residential+Construction",
    benefits: [
      "Custom home design and full builds",
      "Room additions and second-story expansions",
      "Kitchen, bath, and whole-home renovations",
      "In-house project management from permit to punch list",
    ],
    relatedCtaText: "Planning a new home or renovation?",
  },
  {
    slug: "commercial-construction",
    title: "Commercial Construction",
    shortDescription:
      "Ground-up builds and tenant fit-outs delivered on schedule and on budget.",
    description: [
      "Acorn Constructions delivers commercial projects for owners, developers, and business operators who need a builder that treats deadlines and budgets as commitments, not estimates. We've built retail spaces, offices, restaurants, and light-industrial facilities, and we bring the same rigor to every square foot.",
      "Our commercial crews coordinate closely with architects, engineers, and inspectors from pre-construction through closeout, so you get one point of contact and a predictable path to opening day.",
    ],
    icon: Building2,
    heroImage: "https://placehold.co/1600x900/1c1917/e7e5e4?text=Commercial+Construction",
    benefits: [
      "Ground-up commercial builds",
      "Tenant improvements and interior fit-outs",
      "Retail, office, restaurant, and light-industrial experience",
      "Detailed scheduling with transparent budget tracking",
    ],
    relatedCtaText: "Have a commercial build or fit-out coming up?",
  },
  {
    slug: "specialty-services",
    title: "Specialty Services",
    shortDescription:
      "Decks, outdoor living, structural repair, and the projects that don't fit a standard mold.",
    description: [
      "Not every project is a full build, and our specialty division exists for exactly that reason. We take on decks and outdoor living spaces, structural repairs, storm and water damage restoration, and smaller scope work that still deserves a licensed, experienced crew.",
      "Because our specialty team draws on the same tradespeople and project managers as our residential and commercial divisions, you get big-builder resources applied to a project of any size.",
    ],
    icon: Wrench,
    heroImage: "https://placehold.co/1600x900/1c1917/e7e5e4?text=Specialty+Services",
    benefits: [
      "Decks, porches, and outdoor living spaces",
      "Structural repair and reinforcement",
      "Storm, fire, and water damage restoration",
      "Smaller-scope and single-trade projects",
    ],
    relatedCtaText: "Have a project that doesn't fit the standard mold?",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
