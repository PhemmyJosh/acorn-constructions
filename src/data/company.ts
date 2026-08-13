import { NavLink } from "@/types";

// PLACEHOLDER — phone, email, and street address are needed from the client.
// The values below are non-functional placeholders standing in until real
// contact details are provided.
export const company = {
  name: "Acorn Construction",
  legalName: "Acorn Construction Ltd.",
  founded: 2011,
  tagline: "Live the values, build the company.",
  headquarters: "Lloydminster, Alberta, Canada",
  serviceArea: "Alberta and Saskatchewan",
  serviceAreaLine: "Proudly serving Alberta and Saskatchewan",
  phoneDisplay: "(000) 000-0000",
  phoneHref: "tel:+10000000000",
  email: "info@acornconstruction.example",
  address: {
    line1: "Street address needed from client",
    cityStateZip: "Lloydminster, Alberta, Canada",
  },
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
  },
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];
