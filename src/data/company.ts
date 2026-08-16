import { NavLink } from "@/types";

// PLACEHOLDER: email is still needed from the client.
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
  email: "info@acornconstruction.example",
  address: {
    line1: "146C Miller St",
    cityStateZip: "Blackfoot, Alberta, T9V 0Y4",
  },
  social: {
    facebook: "https://www.facebook.com/Acornconstructionltd/",
    linkedin: "https://www.linkedin.com/company/143066254/",
  },
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];
