"use client";

import { ImagePlus } from "lucide-react";
import { saveProject } from "../content-actions";
import ProjectFields from "./ProjectFields";
import { type ProjectRow } from "@/lib/content-constants";
import { panelClasses, primaryButton, secondaryButton } from "./styles";

/**
 * Inline edit form for an existing project, opened by ?edit=<id>.
 *
 * Creating a project goes through ProjectCreateOverlay instead: this form
 * stays inline because editing is already a focused, one-row-at-a-time state
 * with the row it belongs to on screen, whereas creating used to mean
 * scrolling past the whole table to find an empty form.
 */
export default function ProjectForm({ project }: { project: ProjectRow }) {
  return (
    <form action={saveProject} className={panelClasses}>
      <input type="hidden" name="id" value={project.id} />

      <h3 className="mb-5 font-heading text-lg uppercase tracking-wide text-acorn-charcoal">
        Edit &quot;{project.title}&quot;
      </h3>

      <ProjectFields project={project} idPrefix={`edit-project-${project.id}`} />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" className={primaryButton}>
          <ImagePlus size={14} aria-hidden="true" />
          Save changes
        </button>
        <a href="/admin?tab=projects" className={secondaryButton}>
          Cancel
        </a>
      </div>
    </form>
  );
}
