import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import MasonryGrid from "@/components/projects/MasonryGrid";
import { projects } from "@/data/projects";

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

export default function GalleryPreview() {
  const featured = FEATURED_IDS.map((id) => projects.find((project) => project.id === id)).filter(
    (project): project is NonNullable<typeof project> => Boolean(project)
  );

  return (
    <Section tone="cream">
      <SectionHeading
        eyebrow="Our Work"
        title="A look at recent builds"
        align="center"
        className="mx-auto"
      />
      <div className="mt-14">
        <MasonryGrid projects={featured} />
      </div>
      <div className="mt-4 flex justify-center">
        <Button href="/projects" variant="secondary">
          View All Projects
        </Button>
      </div>
    </Section>
  );
}
