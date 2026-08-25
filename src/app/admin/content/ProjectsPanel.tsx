import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import {
  categoryLabel,
  getProjectRows,
  isUploadedFile,
  projectImageSrc,
} from "@/lib/content-data";
import ProjectForm from "./ProjectForm";
import { ContentDeleteButton, ReorderButtons } from "./ContentControls";
import {
  tableClasses,
  tableWrapper,
  tdClasses,
  thClasses,
  theadClasses,
} from "./styles";

/**
 * Projects tab: the gallery in display order, with an add/edit form beneath.
 * Editing is driven by ?edit=<id> so the whole panel stays server-rendered,
 * matching how the submission detail view works.
 */
export default async function ProjectsPanel({ editId }: { editId: number | null }) {
  const rows = await getProjectRows();
  const editing = editId ? rows.find((row) => row.id === editId) : undefined;

  return (
    <>
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
                      <Link
                        href={`/admin?tab=projects&edit=${row.id}`}
                        aria-label={`Edit ${row.title}`}
                        title="Edit"
                        className="rounded-sm p-1.5 text-acorn-charcoal/60 transition-colors hover:bg-acorn-stone hover:text-acorn-charcoal"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </Link>
                      <ContentDeleteButton
                        kind="project"
                        id={row.id}
                        name={row.title}
                        hasUploadedImage={isUploadedFile(row.image_filename)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <ProjectForm key={editing?.id ?? "new"} project={editing} />
      </div>
    </>
  );
}
