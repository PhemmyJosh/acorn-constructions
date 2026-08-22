"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { deleteSubmission } from "./actions";
import type { TabKey } from "@/lib/admin-data";

/**
 * Delete affordance used in both the table row and the detail view. Opens a
 * confirmation dialog rather than deleting on click, since this is irreversible.
 */
export default function DeleteButton({
  tab,
  id,
  name,
  hasResume,
  listParams,
  variant = "icon",
}: {
  tab: TabKey;
  id: number;
  name: string;
  /** Careers rows only: warns that the stored resume goes with the row. */
  hasResume?: boolean;
  /** Preserved so the redirect lands back on the same filter/sort. */
  listParams: Record<string, string>;
  variant?: "icon" | "button";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          aria-label={`Delete submission from ${name}`}
          title={`Delete submission from ${name}`}
          onClick={(event) => {
            // The whole row is clickable; this must not also open the detail.
            event.stopPropagation();
            setOpen(true);
          }}
          className="rounded-sm p-1.5 text-acorn-charcoal/45 transition-colors hover:bg-acorn-rust/10 hover:text-acorn-rust focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-acorn-rust"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-sm border border-acorn-rust/40 px-4 py-2 font-heading text-xs uppercase tracking-[0.15em] text-acorn-rust transition-colors hover:bg-acorn-rust/10"
        >
          <Trash2 size={14} aria-hidden="true" />
          Delete
        </button>
      )}

      <ConfirmDialog
        open={open}
        title="Delete this submission?"
        confirmLabel="Delete permanently"
        onCancel={() => setOpen(false)}
        formAction={deleteSubmission}
        hiddenFields={{ tab, id: String(id), ...listParams }}
      >
        <p>
          This permanently deletes the submission from{" "}
          <span className="font-semibold text-acorn-charcoal">{name}</span>.
          There is no undo and no backup copy in the dashboard.
        </p>
        {tab === "careers" && (
          <p className="rounded-sm border border-acorn-rust/30 bg-acorn-rust/5 px-3 py-2 text-acorn-rust">
            {hasResume
              ? "This will also permanently delete the stored résumé file. That is the only copy. "
              : "This will also delete any stored résumé data for this application. "}
            Employment standards often expect job applications to be retained
            for a period — check before deleting.
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
