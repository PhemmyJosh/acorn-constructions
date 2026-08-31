import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import MasonryGrid from "@/components/projects/MasonryGrid";
import Reveal from "@/components/motion/Reveal";
import { getGalleryProjects } from "@/lib/content-data";

/**
 * How many projects the home page previews before sending people to /projects.
 *
 * This used to be a hardcoded list of slugs from the old static data file,
 * which silently matched nothing once projects moved into the database (rows
 * are keyed by numeric id). The preview is now simply the first N in the
 * client's chosen display order, so reordering in the admin's Projects tab
 * also changes what the home page features.
 */
const PREVIEW_COUNT = 9;

export default async function GalleryPreview() {
  const projects = await getGalleryProjects();
  const featured = projects.slice(0, PREVIEW_COUNT);

  // Nothing to show and nothing to link to: skip the section entirely rather
  // than rendering an empty band with a heading over it.
  if (featured.length === 0) return null;

  return (
    <Section tone="cream">
      <Reveal>
        <SectionHeading
          eyebrow="Our Work"
          title="A look at recent builds"
          align="center"
          className="mx-auto"
        />
      </Reveal>
      {/* The masonry grid uses CSS columns, so it reveals as one unit rather
          than per-tile to avoid fighting the column flow. */}
      <Reveal className="mt-14">
        <MasonryGrid projects={featured} />
      </Reveal>
      <Reveal className="mt-4 flex justify-center">
        <Button href="/projects" variant="secondary">
          View All Projects
        </Button>
      </Reveal>
    </Section>
  );
}
