import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import MasonryGrid from "@/components/projects/MasonryGrid";
import Reveal from "@/components/motion/Reveal";
import { getGalleryProjects } from "@/lib/content-data";

const FEATURED_IDS = [
  "lakeview-timber-build",
  "riverside-workshop-build",
  "oakhaven-crew-detail",
  "stonefield-measure-detail",
  "willowbrook-framing-detail",
  "summit-foundation-crew",
  "harborview-concrete-work",
  "northfield-storage-building",
  "acreage-outbuilding",
];

export default async function GalleryPreview() {
  const projects = await getGalleryProjects();

  const featured = FEATURED_IDS.map((id) => projects.find((project) => project.id === id)).filter(
    (project): project is NonNullable<typeof project> => Boolean(project)
  );

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
