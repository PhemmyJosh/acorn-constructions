import type { MetadataRoute } from "next";
import { company } from "@/data/company";

/**
 * Serves /manifest.webmanifest.
 *
 * Exists so the 192 and 512 icons are actually referenced by something. The
 * `icon`/`apple-icon` file conventions cover the browser tab and iOS home
 * screen, but nothing reads `public/icon-192.png` or `icon-512.png` on its
 * own — those sizes are what Android and Chrome's install prompt look for, and
 * a manifest is the only place to declare them. Without this they would be two
 * committed files that no page ever asks for.
 *
 * Like robots.ts and sitemap.ts, this has to sit at the root of `app` rather
 * than inside the `(site)` route group.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${company.legalName} — Residential, Commercial & Post Frame Builders`,
    short_name: company.name,
    description:
      "Lloydminster, Alberta-based builder delivering residential, light " +
      "commercial, and post frame construction since 2011.",
    start_url: "/",
    display: "standalone",
    // --color-acorn-cream from globals.css, matching the circle the icons are
    // drawn on so the splash screen and the icon share a ground.
    background_color: "#f7f2ea",
    // --color-acorn-charcoal, the site's chrome colour, which is what tints the
    // Android address bar rather than the icon's own background.
    theme_color: "#262018",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
