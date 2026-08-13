import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import ProjectGrid from "@/components/projects/ProjectGrid";
import FinalCta from "@/components/home/FinalCta";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects | Acorn Construction",
  description:
    "Browse a selection of Acorn Construction's residential, light commercial, and post frame projects across Alberta and Saskatchewan.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="A portfolio built on finished projects"
        description="A look at recent residential, commercial, and specialty builds. Click any project for a closer look."
      />

      <Section tone="light">
        <ProjectGrid projects={projects} />
      </Section>

      <FinalCta />
    </>
  );
}
