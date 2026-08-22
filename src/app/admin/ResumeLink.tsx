"use client";

import { Download } from "lucide-react";

/**
 * Résumé download link for a table row.
 *
 * A client component purely so it can stop the click from bubbling up to the
 * row, which would otherwise open the detail view at the same time as starting
 * the download.
 */
export default function ResumeLink({
  id,
  filename,
}: {
  id: number;
  filename: string;
}) {
  return (
    <a
      href={`/api/admin/resume/${id}`}
      title={filename}
      onClick={(event) => event.stopPropagation()}
      className="inline-flex items-center gap-1.5 text-acorn-rust hover:underline"
    >
      <Download size={14} aria-hidden="true" />
      Download
    </a>
  );
}
