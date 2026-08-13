# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start the dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build; also runs the TypeScript check
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config via `eslint.config.mjs`, extends `next/core-web-vitals` + `next/typescript`)
- `npx tsc --noEmit` — type-check only, faster than a full build

There is no test suite configured in this repository (no test runner in `package.json`).

## Architecture

Next.js 16 App Router + TypeScript + Tailwind CSS v4 + React 19. Path alias `@/*` maps to `src/*`.

### Tailwind v4: no config file

There is no `tailwind.config.ts`. This project uses Tailwind v4's CSS-first config: the brand
palette and font tokens are declared in the `@theme` block in `src/app/globals.css`
(`--color-acorn-charcoal`, `-bronze`, `-gold`, `-rust`, `-cream`, `-stone`), which is what makes
utilities like `bg-acorn-gold` or `text-acorn-charcoal/70` available. Add new design tokens there,
not in a JS config. Headings use Oswald and body text uses Inter, both loaded via
`next/font/google` in `src/app/layout.tsx` and exposed as `--font-oswald`/`--font-inter`, then
mapped to `--font-heading`/`--font-sans` in `globals.css`.

### Content lives in `src/data`, not in components

Page and section components are largely presentational; the actual copy and business data lives in
`src/data/*.ts` and is imported in. This is the primary place to change site content:

- `company.ts` — single source for contact info, service area, and tagline. Several fields (phone,
  email, street address) are non-functional placeholders with `PLACEHOLDER` comments marking values
  still needed from the client.
- `services.ts` — the three services (residential/light-commercial framing, foundations, post
  frame). `getServiceBySlug` and `generateStaticParams` in `app/services/[slug]/page.tsx` read this
  array directly, so adding a service here automatically creates its detail page.
- `coreValues.ts`, `team.ts`, `testimonials.ts`, `stats.ts`, `howWeWork.ts`, `projects.ts` — feed
  the corresponding home/about/projects sections.
- `photos.ts` — central registry of real stock photography (via a `pexelsUrl(id)` helper for
  Pexels CDN URLs). Non-headshot imagery across the whole site is sourced through named exports
  here (`photos.residentialFraming`, `photos.trussInterior`, etc.) rather than hardcoded URLs, so
  the same photo can be reused consistently across pages. Team headshots in `team.ts` are still
  `placehold.co` placeholders pending real photos from the client.
- Any new external image host must be added to `images.remotePatterns` in `next.config.ts`
  (currently `placehold.co`, `images.pexels.com`, `images.unsplash.com`).

### Component layers

- `components/ui` — generic brand-styled primitives (`Button`, `Card`, `Container`, `Section`,
  `SectionHeading`, `PageHero`, `SocialIcons`). `Section` takes a `tone` prop (`cream | stone |
  dark`) — this is the site's alternating-background system; new sections should use it instead of
  hardcoding background colors. `PageHero` optionally takes a `backgroundImage` for a photo hero
  banner (used on `/about`); omitted, it falls back to a plain charcoal banner.
- `components/layout` — `Header`/`Footer`/`MobileNav` (site chrome, logo treatment).
- `components/shared` — `CoreValues`, rendered as-is on both the home page and `/about` with
  different heading text via props, backed by the same `coreValues.ts` data.
- `components/home`, `components/services`, `components/projects`, `components/contact` —
  page-specific sections, generally one component per home-page section (see the import order in
  `src/app/page.tsx` for the current section sequence).

### Gallery/masonry pattern

`MasonryGrid` (`components/projects`) is a presentational CSS-columns masonry grid (varying aspect
ratios per tile) reused two ways:

- `GalleryPreview` (home page) renders it read-only, with every tile linking to `/projects`.
- `ProjectsGalleryClient` (`"use client"`, used on `/projects`) wraps it with category-tab filter
  state and wires tile clicks to `Lightbox` for a full prev/next/Escape-driven lightbox.

New gallery photos go in `data/projects.ts`; `category` must be one of the `ProjectCategory` union
in `src/types/index.ts`.

### Placeholder conventions

Search for `PLACEHOLDER` and `NEEDED FROM CLIENT` before treating any contact info, testimonial, or
headshot as real — phone, email, street address, testimonial quotes, and team headshots are
intentionally fake pending real client data.

### No backend

`ContactForm` is client-only UI; its submit handler just `console.log`s the form data. There is no
API route, server action, or email wiring behind it.
