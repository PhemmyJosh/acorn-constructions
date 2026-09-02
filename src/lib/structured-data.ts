import { company } from "@/data/company";
import { services } from "@/data/services";

/**
 * LocalBusiness structured data for the site.
 *
 * Typed as GeneralContractor, a schema.org subtype of HomeAndConstruction-
 * Business and therefore of LocalBusiness. The more specific type is worth
 * using: it inherits everything LocalBusiness offers while telling a search
 * engine what kind of local business this is, which a generic LocalBusiness
 * leaves it to infer from prose.
 *
 * Every value comes from company.ts and services.ts. Nothing here is retyped,
 * so the address a visitor reads in the footer and the address a crawler reads
 * cannot drift apart.
 */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    // Stable identifier for this entity, so other nodes could reference it.
    "@id": `${company.siteUrl}/#organization`,
    name: company.legalName,
    alternateName: company.name,
    url: company.siteUrl,
    logo: `${company.siteUrl}/acorn-logo.png`,
    image: `${company.siteUrl}/acorn-logo.png`,
    description:
      `${company.legalName} is a construction company based in ` +
      `${company.headquarters}, delivering residential and light commercial ` +
      "wood frame construction, foundations, and post frame construction " +
      `across ${company.serviceArea} since ${company.founded}.`,
    telephone: company.phoneDisplay,
    email: company.email,
    foundingDate: String(company.founded),
    slogan: company.tagline,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.line1,
      addressLocality: company.address.locality,
      addressRegion: company.address.regionCode,
      postalCode: company.address.postalCode,
      addressCountry: company.address.countryCode,
    },
    // Two provinces rather than a radius: the business describes its reach by
    // province, and AdministrativeArea is how schema.org expresses that.
    areaServed: [
      { "@type": "AdministrativeArea", name: "Alberta" },
      { "@type": "AdministrativeArea", name: "Saskatchewan" },
    ],
    // The services in machine-readable form, rather than leaving a crawler to
    // pull them out of the description sentence.
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Construction services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.shortDescription,
          url: `${company.siteUrl}/services/${service.slug}`,
        },
      })),
    },
    sameAs: [
      company.social.facebook,
      company.social.instagram,
      company.social.linkedin,
    ],
  };
}

/**
 * Serialises the schema for embedding in a <script> tag.
 *
 * `<` is escaped because a literal `</script>` inside a JSON string would end
 * the element early and let the rest of the payload run as markup. None of the
 * current values contain one, but this is data that a future edit could change
 * without anyone remembering the constraint.
 */
export function localBusinessJsonLd(): string {
  return JSON.stringify(localBusinessSchema()).replace(/</g, "\\u003c");
}
