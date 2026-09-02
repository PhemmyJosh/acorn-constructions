import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import ProjectsGalleryClient from "@/components/projects/ProjectsGalleryClient";
import FinalCtaBanner from "@/components/shared/FinalCtaBanner";
import { getGalleryProjects } from "@/lib/content-data";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Project Gallery — Framing & Post Frame Builds",
  description:
    "Photos of completed Acorn Construction work across Alberta and Saskatchewan: custom home framing, foundation pours, shops and agricultural post frame buildings.",
  path: "/projects",
});

// Content is client-editable, so this reads the database per request rather
// than baking rows in at build time. It also keeps the build independent of the
// database being reachable.
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getGalleryProjects();

  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="A portfolio built on finished projects"
        description="A look at recent residential, foundation, and post frame builds. Filter by category or click any project for a closer look."
      />

      <Section tone="cream">
        <ProjectsGalleryClient projects={projects} />
      </Section>

      <FinalCtaBanner />
    </>
  );
}
