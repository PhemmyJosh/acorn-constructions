import { LucideIcon } from "lucide-react";

export interface Service {
  slug: string;
  title: string;
  shortDescription: string;
  description: string[];
  icon: LucideIcon;
  heroImage: string;
  benefits: string[];
  relatedCtaText: string;
}

export interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface Project {
  id: string;
  title: string;
  category: "Residential" | "Commercial" | "Specialty";
  image: string;
  alt: string;
}

export interface NavLink {
  label: string;
  href: string;
}
