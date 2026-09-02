import { LucideIcon } from "lucide-react";

export interface Service {
  slug: string;
  title: string;
  /** Condensed label used in the nav dropdown, where the full title is too long. */
  navLabel: string;
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

/** Display labels matching the `category` enum on the projects table. */
export type ProjectCategory =
  | "Residential"
  | "Commercial"
  | "Foundations"
  | "Post Frame";

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  image: string;
  alt: string;
  /** Longer copy entered in the admin. Shown in the lightbox detail view. */
  description?: string | null;
}

export interface NavLink {
  label: string;
  href: string;
  /** When present, this nav item renders as a dropdown (desktop) or accordion (mobile). */
  children?: Array<{ label: string; href: string }>;
}
