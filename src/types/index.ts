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
  location: string;
}

export type ProjectCategory = "Residential" | "Foundations" | "Post Frame";

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  image: string;
  alt: string;
}

export interface NavLink {
  label: string;
  href: string;
}
