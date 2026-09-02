import { NavLink } from "@/types";
import { services } from "@/data/services";

/**
 * Broken into parts because schema.org's PostalAddress wants locality, region
 * and postal code as separate fields. The one-line `cityStateZip` the footer
 * and contact page render is derived from these rather than stored alongside
 * them, so the displayed address and the structured data cannot disagree.
 */
const address = {
  line1: "146C Miller St",
  locality: "Blackfoot",
  region: "Alberta",
  /** ISO 3166-2 subdivision code, which is what schema.org expects. */
  regionCode: "AB",
  postalCode: "T9V 0Y4",
  country: "Canada",
  countryCode: "CA",
};

export const company = {
  name: "Acorn Construction",
  legalName: "Acorn Construction Ltd.",
  // Canonical production origin, no trailing slash. Single-sourced because
  // three places need it to agree: `metadataBase` in app/layout.tsx, the
  // absolute <loc> URLs in app/sitemap.ts (metadataBase does not apply to
  // sitemap entries — they must be absolute already), and the Sitemap line in
  // app/robots.txt. A crawler treats a sitemap on a different origin from the
  // URLs inside it as untrusted, so drift here is not cosmetic.
  siteUrl: "https://acornconstruction.ca",
  founded: 2011,
  tagline: "Live the values, build the company.",
  headquarters: "Lloydminster, Alberta, Canada",
  serviceArea: "Alberta and Saskatchewan",
  serviceAreaLine: "Proudly serving Alberta and Saskatchewan",
  phoneDisplay: "+1 780 205 6361",
  phoneHref: "tel:+17802056361",
  email: "mark@acornconstruction.ca",
  address: {
    ...address,
    /** One-line form used in the footer and on the contact page. */
    cityStateZip: `${address.locality}, ${address.region}, ${address.postalCode}`,
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
