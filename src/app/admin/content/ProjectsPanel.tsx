import Image from "next/image";
import {
  categoryLabel,
  getProjectRows,
  projectImageSrc,
} from "@/lib/content-data";
import { isManagedUpload } from "@/lib/content-upload";
import ProjectOverlayProvider, {
  ProjectCreateTrigger,
  ProjectEditTrigger,
  ProjectSaveAlert,
} from "./ProjectOverlayProvider";
import { ContentDeleteButton, ReorderButtons } from "./ContentControls";
import {
  tableClasses,
  tableWrapper,
  tdClasses,
  thClasses,
  theadClasses,
} from "./styles";

/**
 * Projects tab: the gallery in display order.
 *
 * Both creating and editing open the same slide-in overlay — there is no
 * inline form and no ?edit= URL state any more. Two patterns for one job was
 * the problem: creating meant scrolling past the whole table to an empty form,
 * and editing jumped to that same form underneath it.
 */
export default async function ProjectsPanel() {
  const rows = await getProjectRows();

  return (
    <ProjectOverlayProvider>
      {/* Top of the tab and right-aligned, so it reads as the primary action
          for this section rather than something buried under the table. */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-heading text-[11px] uppercase tracking-[0.15em] text-acorn-charcoal/60">
          {rows.length} {rows.length === 1 ? "project" : "projects"}
        </p>
        <ProjectCreateTrigger />
      </div>

      <ProjectSaveAlert />

      <div className={tableWrapper}>
        <table className={tableClasses}>
          <thead className={theadClasses}>
            <tr>
              <th className={thClasses}>Photo</th>
              <th className={thClasses}>Title</th>
              <th className={thClasses}>Category</th>
              <th className={thClasses}>Caption</th>
              <th className={thClasses}>Order</th>
              {/* relative: sr-only is position:absolute, and with no
                  positioned ancestor it resolves against the initial containing
                  block, escaping this table's horizontal scroll container and
                  making the whole page scroll sideways on mobile. */}
              <th className={`${thClasses} relative`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className={`${tdClasses} py-6`} colSpan={6}>
                  No projects yet. The site is showing its built-in gallery
                  until you add one.
                </td>
              </tr>
            )}

            {rows.map((row, index) => {
              const src = projectImageSrc(row.image_filename);
              return (
                <tr
                  key={row.id}
                  className="border-t border-acorn-bronze/15 even:bg-acorn-cream/50"
                >
                  <td className={tdClasses}>
                    <div className="relative h-12 w-16 overflow-hidden rounded-sm bg-acorn-stone">
                      {src && (
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className={`${tdClasses} font-semibold text-acorn-charcoal`}>
                    {row.title}
                  </td>
                  <td className={`${tdClasses} whitespace-nowrap`}>
                    {categoryLabel(row.category)}
                  </td>
                  <td className={tdClasses}>
                    <div className="max-w-xs truncate">{row.caption || "—"}</div>
                  </td>
                  <td className={`${tdClasses} whitespace-nowrap`}>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums text-acorn-charcoal/50">
                        {row.display_order}
                      </span>
                      <ReorderButtons
                        table="projects"
                        id={row.id}
                        isFirst={index === 0}
                        isLast={index === rows.length - 1}
                      />
                    </div>
                  </td>
                  <td className={`${tdClasses} whitespace-nowrap`}>
                    <div className="flex items-center gap-1">
                      <ProjectEditTrigger project={row} />
                      <ContentDeleteButton
                        kind="project"
                        id={row.id}
                        name={row.title}
                        hasUploadedImage={isManagedUpload(row.image_filename)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ProjectOverlayProvider>
  );
}
