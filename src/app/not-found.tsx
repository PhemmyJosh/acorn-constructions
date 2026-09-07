import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { photos } from "@/data/photos";
import SiteLayout from "./(site)/layout";

/**
 * The site's 404 page, for any URL that matches no route.
 *
 * It lives at the root of `app/` rather than inside `(site)`, because that is
 * the placement Next.js documents for catching unmatched URLs app-wide. That
 * puts it outside the `(site)` route group, so it would otherwise render with
 * the root layout's bare shell and no navigation — a dead end for exactly the
 * visitor who most needs a way out. Rendering `SiteLayout` here restores the
 * header, footer and <main> landmark, and reuses the one component the public
 * pages already use so the chrome cannot drift out of sync with them.
 *
 * Copy: "This page hasn't been built yet" was chosen over "Looks like this
 * page took a wrong turn on the job site" and "Nothing built here yet" — the
 * first reads as a plain statement of fact that happens to be literal for a
 * builder, where the job-site line is a joke at a lost visitor's expense and
 * the third is vaguer about what actually went wrong.
 */
export default function NotFound() {
  return (
    <SiteLayout>
      {/* min-height rather than the home hero's 90vh: this is a recovery
          moment, so the headline and both links stay in the first screen at
          every width, with no scrolling needed to get out. */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-acorn-charcoal text-acorn-cream">
        {/* Decorative, so the alt is empty: the copy beside it already says
            everything a screen reader needs.

            An open timber frame is the shot in the registry that matches the
            headline literally -- a structure part-built, nothing finished. The
            finished post-frame and the poured-foundation shots were both tried
            here and read against the copy: one shows a completed building, the
            other is dominated by bare dirt. */}
        <Image
          src={photos.trussInterior}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        {/* Flat tint rather than a gradient, following the home hero, so text
            legibility is even across the whole band instead of varying with
            where a line happens to sit.

            Deliberately deeper than the home hero's /45: at 70% even a
            blown-out white sky composites to #5c5852 or darker, which holds
            cream at 5.3:1 — above 4.5:1 for the body line, not just for the
            large headline. The home hero can afford /45 because its own
            photographs are known and have no white regions; this one is
            picked from the registry and may be swapped for a real project
            photo later, so the overlay carries the contrast on its own. */}
        <div className="absolute inset-0 bg-acorn-charcoal/70" />

        {/* Top padding clears the fixed header, matching PageHero's rhythm. */}
        <Container className="relative z-10 flex flex-col gap-6 pb-20 pt-32 sm:pb-24 sm:pt-36">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-acorn-gold">
            404 &mdash; Page Not Found
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            This page hasn&apos;t been built yet.
          </h1>
          {/* Full-opacity cream, not cream/70: the dimmed variant is what put
              the home hero's body copy under 4.5:1. */}
          <p className="max-w-xl text-lg leading-relaxed text-acorn-cream">
            The link you followed doesn&apos;t lead anywhere. It may have moved,
            or the address has a typo.
          </p>
          {/* No scroll-reveal on this band. Everywhere else a fade-in is
              decoration; here it would delay the only two controls that get a
              lost visitor out, so the recovery path renders immediately. */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button href="/" variant="primary">
              Back to Home Page
            </Button>
            {/* Same bordered-cream treatment as the home hero's secondary
                action, which is the site's established pairing for a gold
                button on charcoal. */}
            <Link
              href="/services"
              className="flex items-center justify-center rounded-sm border border-acorn-cream/70 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-acorn-cream transition-colors duration-200 hover:bg-acorn-cream hover:text-acorn-charcoal"
            >
              See Our Services
            </Link>
          </div>
        </Container>
      </section>
    </SiteLayout>
  );
}
