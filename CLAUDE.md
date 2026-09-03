# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Two companion docs carry the operational detail and are the right place to look before changing
anything that touches deployment or the local database:

- [LOCAL-DEV.md](LOCAL-DEV.md) — running the site locally, including the portable MySQL and its
  start/stop script.
- [DEPLOYMENT.md](DEPLOYMENT.md) — Hostinger, environment variables, R2, rate limiting, security
  headers, SEO, and what is still outstanding before launch.

## Commands

- `npm run dev` — start the dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build; also runs the TypeScript check
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config via `eslint.config.mjs`, extends `next/core-web-vitals` + `next/typescript`)
- `npx tsc --noEmit` — type-check only, faster than a full build
- `node scripts/mysql-local.mjs start|stop|status` — the local development MySQL

There is no test suite configured in this repository (no test runner in `package.json`).
Verification in this project is done by building, then driving the running site in a browser.

**`next` is pinned to an exact `16.2.12`, and `npm audit fix --force` must not be run.** It bumps
Next to a version whose prebuilt SWC binary needs a newer GLIBC than Hostinger's build image has,
which breaks every deploy — silently, because a failed build keeps serving the previous one. Plain
`npm audit fix` is safe. See DEPLOYMENT.md for the exact error.

## Architecture

Next.js 16 App Router + TypeScript + Tailwind CSS v4 + React 19. Path alias `@/*` maps to `src/*`.
MySQL via `mysql2`, transactional email via `nodemailer`, project photo storage in Cloudflare R2
via `@aws-sdk/client-s3`.

### Route groups: `(site)` vs `/admin`

`src/app/layout.tsx` is a shell only — `<html>`/`<body>`, fonts, global styles, the LocalBusiness
JSON-LD and the Search Console meta tag.

- `src/app/(site)/` holds the public pages and its own layout, which adds the marketing chrome
  (`Header`, `Footer`). The home page is `src/app/(site)/page.tsx`.
- `src/app/admin/` sits **outside** that group deliberately, with bare chrome, so the marketing nav
  and CTAs do not wrap an internal tool.
- `src/app/api/` holds the three public form endpoints plus the authenticated résumé download.

The route group does not affect URLs, but `robots.ts`, `sitemap.ts` and `manifest.ts` must live at
the **root** of `app/`, not inside `(site)`, or the file conventions are not picked up.

`force-dynamic` is set on `/`, `/projects`, `/services/[slug]` and `/admin`: their content is read
from the database per request, so baking them at build time would freeze the client's edits and
make the build require MySQL.

### Tailwind v4: no config file

There is no `tailwind.config.ts`. This project uses Tailwind v4's CSS-first config: the brand
palette and font tokens are declared in the `@theme` block in `src/app/globals.css`
(`--color-acorn-charcoal`, `-bronze`, `-gold`, `-rust`, `-cream`, `-stone`), which is what makes
utilities like `bg-acorn-gold` or `text-acorn-charcoal/70` available. Add new design tokens there,
not in a JS config. Headings use Oswald and body text uses Inter, both loaded via
`next/font/google` in `src/app/layout.tsx` and exposed as `--font-oswald`/`--font-inter`, then
mapped to `--font-heading`/`--font-sans` in `globals.css`.

`next/font/google` self-hosts both faces at build time — they are served from `/_next/static/media`
and nothing is fetched from Google at runtime. That is why the Content-Security-Policy's
`font-src 'self'` is complete and must not list `fonts.googleapis.com`.

### Two sources of content: the database, and `src/data`

Some content is client-editable through `/admin` and lives in MySQL; the rest is compiled in from
`src/data/*.ts`. Knowing which is which matters before editing copy.

**Database-backed** (edit through `/admin`, not in code) — projects, testimonials, and the service
overview paragraphs. `src/lib/content-data.ts` reads them and **falls back to the `src/data`
equivalents when a table is empty or unreachable**, so the public site never renders blank. Editing
`src/data/projects.ts` therefore changes only that fallback, not what a visitor normally sees.

**Compiled in from `src/data`** — everything else:

- `company.ts` — single source for the business identity: legal name, `siteUrl`, founding year,
  tagline, service area, phone, email, and the address split into parts. **These are the real,
  confirmed business details.** `siteUrl` in particular is read by `metadataBase`, the sitemap's
  absolute URLs, the `Sitemap:` line in robots.txt and the JSON-LD — if the domain ever changes,
  edit that one value.
- `services.ts` — the three services (residential/light-commercial framing, foundations, post
  frame). `getServiceBySlug` and `generateStaticParams` in `app/(site)/services/[slug]/page.tsx`
  read this array directly, so adding a service here creates its detail page, its sitemap entry and
  its `OfferCatalog` entry in the structured data. Each entry also carries `seoTitle`,
  `seoDescription` and `heroImageAlt`.
- `coreValues.ts`, `team.ts`, `howWeWork.ts`, `careers.ts`, `heroImages.ts` — feed the
  corresponding home/about/careers sections and the hero carousel.
- `photos.ts` — central registry of real stock photography (via a `pexelsUrl(id)` helper for
  Pexels CDN URLs). Non-headshot imagery across the whole site is sourced through named exports
  here (`photos.residentialFraming`, `photos.trussInterior`, etc.) rather than hardcoded URLs, so
  the same photo can be reused consistently across pages.
- `projects.ts`, `testimonials.ts` — the static fallbacks described above.

Any new external image host must be added to `images.remotePatterns` in `next.config.ts`
(currently `placehold.co`, `images.pexels.com`, `images.unsplash.com`, plus the R2 bucket hostname
derived at build time from `R2_PUBLIC_URL`). It does **not** need adding to the CSP: every remote
image is proxied through `/_next/image`, so the browser only ever fetches it from this origin.

### Component layers

- `components/ui` — generic brand-styled primitives (`Button`, `Card`, `Container`, `Section`,
  `SectionHeading`, `PageHero`, `SocialIcons`, plus `FormStatus` and `HoneypotField` for the
  forms). `Section` takes a `tone` prop (`cream | stone | dark`) — this is the site's
  alternating-background system; new sections should use it instead of hardcoding background
  colors. `PageHero` optionally takes a `backgroundImage` for a photo hero banner (used on
  `/about`); omitted, it falls back to a plain charcoal banner.
- `components/layout` — `Header`/`Footer`/`MobileNav`/`ServicesDropdown` (site chrome, logo
  treatment).
- `components/shared` — `CoreValues` and `FinalCtaBanner`, reused across several pages with
  different heading text via props.
- `components/motion` — `Reveal`, the shared scroll-reveal wrapper.
- `components/home`, `components/services`, `components/projects`, `components/contact`,
  `components/careers`, `components/estimate` — page-specific sections, generally one component per
  home-page section (see the import order in `src/app/(site)/page.tsx` for the current sequence).

Animation is framer-motion, and every animated component honours `useReducedMotion` by collapsing
to a **zero-duration transition** rather than dropping the `animate` prop — omitting it would leave
SSR content invisible and cause a hydration mismatch.

### Gallery/masonry pattern

`MasonryGrid` (`components/projects`) deals tiles into **explicit flex columns** via
`balanceColumns.ts`, which packs them for near-equal column height. It used to use CSS
multi-column; that overshot badly because each tile is an indivisible fixed-aspect block. Tile
aspect ratios are assigned in the component, so heights are known before any image loads and a
late-loading photo can never re-shuffle the layout.

`LightboxGallery` wraps it with the lightbox state (open index, prev/next with wrap, returning
focus to the tile that opened it) and is the single shared implementation used by both galleries:

- `GalleryPreview` (home page) renders the first **6** projects in the client's configured display
  order. Tiles open the lightbox **in place** — they do not navigate to `/projects` — and the arrow
  keys cycle only those six.
- `ProjectsGalleryClient` (`"use client"`, used on `/projects`) adds the category tabs and keys
  `LightboxGallery` on the active category, so switching tabs clears any open lightbox and the
  remembered tile together.

`category` must be one of the `ProjectCategory` union in `src/types/index.ts`.

### Forms and the admin dashboard

All three public forms (`/contact`, `/estimate`, `/careers`) post to a route under `src/app/api/`,
which validates, writes to MySQL, and sends a notification via `src/lib/mailer.ts`. The submission
is saved first and a mail failure is logged rather than thrown, so a mail problem never loses a
submission. `NOTIFY_EMAIL` accepts several comma-separated addresses. Every form shares
`components/ui/FormStatus.tsx` for its loading/success/error states and `HoneypotField` for spam
protection.

`/admin` is a single password-gated dashboard: form submissions with read/unread tracking and a
detail view, plus content management for projects, testimonials and service copy. Two rules hold
throughout it:

- **Every server action re-checks the session itself.** A server action is a POST endpoint in its
  own right and must not rely on the page having rendered the authenticated view.
- **`redirect()` throws.** The content actions run their work through a `guard()` helper and call
  `redirect()` only from the top level, because a `try/catch` wrapped around a body that redirects
  would catch the redirect and report a successful save as a failure.

Project and testimonial create/edit both use one slide-in overlay per entity
(`ProjectOverlay`, `TestimonialOverlay`), each handling both modes off the optional presence of a
row, with a focus trap, Escape/click-outside close, and an unsaved-changes confirmation.

### Things that have bitten this project before

- **`sr-only` is `position: absolute`.** With no positioned ancestor it resolves against the
  initial containing block, escapes an `overflow-x-auto` wrapper and makes the whole page scroll
  sideways. Add `relative` to the containing cell. `body.scrollWidth` reads normal while this
  happens — only attempting `window.scrollTo(600, 0)` and reading `scrollX` detects it.
- **Server Actions cap request bodies at 1MB** by default, separately from any validation we write.
  `experimental.serverActions.bodySizeLimit` is set to `6mb` for photo uploads. That rejection
  happens while the body is still being parsed, so no `try/catch` inside an action can catch it.
- **Nothing writes uploaded photos to disk.** Hostinger rebuilds into a fresh directory each
  deploy, and `next start` snapshots `public/` at boot. Photos go to R2; if R2 is unconfigured the
  upload fails loudly rather than falling back.

### Placeholder conventions

Most placeholders are gone. The contact details in `company.ts` and the founder headshot in
`team.ts` are real. What remains:

- `src/data/testimonials.ts` still carries a `TESTIMONIALS NEEDED FROM CLIENT` marker. It is only
  the fallback for an empty database — the live site reads real testimonials from MySQL — but the
  quotes in that file are invented and must not be treated as real client words.

Search for `PLACEHOLDER` and `NEEDED FROM CLIENT` before treating any remaining copy as final.
