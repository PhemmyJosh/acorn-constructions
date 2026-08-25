import { NavLink } from "@/types";
import { services } from "@/data/services";

export const company = {
  name: "Acorn Construction",
  legalName: "Acorn Construction Ltd.",
  founded: 2011,
  tagline: "Live the values, build the company.",
  headquarters: "Lloydminster, Alberta, Canada",
  serviceArea: "Alberta and Saskatchewan",
  serviceAreaLine: "Proudly serving Alberta and Saskatchewan",
  phoneDisplay: "+1 780 205 6361",
  phoneHref: "tel:+17802056361",
  email: "mark@acornconstruction.ca",
  address: {
    line1: "146C Miller St",
    cityStateZip: "Blackfoot, Alberta, T9V 0Y4",
  },
  social: {
    facebook: "https://www.facebook.com/Acornconstructionltd/",
    instagram: "https://www.instagram.com/acorn_construction_",
    linkedin: "https://www.linkedin.com/company/143066254/",
  },
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    // Renders as a dropdown/accordion. Children are derived from the service
    // data so slugs stay single-sourced.
    label: "Services",
    href: "/services",
    children: services.map((service) => ({
      label: service.navLabel,
      href: `/services/${service.slug}`,
    })),
  },
  { label: "Projects", href: "/projects" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];
