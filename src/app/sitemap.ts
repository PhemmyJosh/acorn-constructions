import type { MetadataRoute } from "next";
import { company } from "@/data/company";
import { services } from "@/data/services";

/**
 * Serves /sitemap.xml.
 *
 * Like robots.ts, this has to sit at the root of `app` rather than inside the
 * `(site)` route group — a route group does not change the URL, but the file
 * convention is only picked up from the app root.
 *
 * URLs are built from `company.siteUrl` and are absolute. `metadataBase` does
 * NOT apply here: it resolves relative paths in page metadata, not sitemap
 * entries, so a relative `url` would emit a `<loc>` a crawler rejects.
 *
 * This is an allowlist, so /admin, /api/* and anything else not named below is
 * excluded by construction rather than by a filter that could be forgotten.
 * robots.ts disallows the admin routes as well — belt and braces, since a
 * sitemap only ever suggests URLs, it cannot hide them.
 *
 * Service detail pages are derived from `services` rather than hardcoded, the
 * same source `generateStaticParams` reads in `services/[slug]/page.tsx`, so
 * adding a service to that array adds its sitemap entry too.
 */

/** Build time. See the note on `lastModified` below. */
const lastModified = new Date();

/**
 * Public marketing pages, most important first.
 *
 * `priority` is relative within this site only — it tells a crawler how to
 * rank these pages against each other, and has no bearing on ranking against
 * anyone else's site.
 */
const pages: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  // The gallery is client-editable from the admin dashboard, so it genuinely
  // turns over faster than the rest of the site.
  { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "yearly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.7 },
  { path: "/estimate", changeFrequency: "yearly", priority: 0.7 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = pages.map((page) => ({
    // The home page is the bare origin: `${siteUrl}/` would emit a trailing
    // slash the rest of the site does not use, which reads as a second URL.
    url: page.path === "/" ? company.siteUrl : `${company.siteUrl}${page.path}`,
    // Build time, not true per-page modification time. The marketing copy
    // ships with the build, so a deploy is the closest honest signal we have.
    // It is deliberately not per-request: overstating freshness on every crawl
    // teaches crawlers to ignore the field.
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const servicePages = services.map((service) => ({
    url: `${company.siteUrl}/services/${service.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Slotted in directly after /services so the XML reads in site order.
  const servicesIndex = staticPages.findIndex(
    (page) => page.url === `${company.siteUrl}/services`
  );
  return [
    ...staticPages.slice(0, servicesIndex + 1),
    ...servicePages,
    ...staticPages.slice(servicesIndex + 1),
  ];
}
