import { NavLink } from "@/types";

export const company = {
  name: "Acorn Constructions",
  phoneDisplay: "(555) 123-4567",
  phoneHref: "tel:+15551234567",
  email: "info@acornconstructions.example",
  address: {
    line1: "482 Foundry Street",
    line2: "Suite 200",
    cityStateZip: "Riverdale, ST 10471",
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
