import type { MetadataRoute } from "next";

/**
 * Serves /robots.txt.
 *
 * Lives at the root of `app`, not inside the `(site)` route group: a route
 * group does not affect the URL, but this file convention is only picked up
 * from the app root.
 *
 * The admin dashboard is the only thing held back. `Disallow` is a prefix
 * match, so `/admin` already covers `/admin?tab=projects` and anything nested
 * under it; the trailing-slash entry is listed alongside it purely so the rule
 * reads unambiguously to a human. `/api/admin/` is the resume download
 * endpoint — it already returns 401 without a session, but there is no reason
 * for the URL to appear in an index either.
 *
 * This is the first of two layers. robots.txt asks a crawler not to fetch the
 * page; the `robots: { index: false, follow: false }` metadata in
 * `app/admin/layout.tsx` tells one that arrives anyway not to index it. Both
 * are needed, because a well-behaved crawler that never fetches /admin can
 * still list the URL if it finds a link to it elsewhere.
 *
 * No `sitemap` entry: this site does not generate a sitemap.xml, and pointing
 * at one that 404s is worse than omitting the line.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/admin/"],
    },
  };
}
