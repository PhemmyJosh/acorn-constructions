"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, X } from "lucide-react";
import ProjectCreateOverlay from "./ProjectCreateOverlay";

/**
 * "Create New Project" trigger, plus the overlay it opens and the confirmation
 * shown after it closes.
 *
 * The success alert lives here rather than in the overlay because the overlay
 * is gone by the time it needs to be read.
 */
export default function ProjectCreateButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    // Focus goes back to the button that opened the panel, so a keyboard user
    // is not dropped at the top of the document.
    triggerRef.current?.focus();
  }, []);

  const onCreated = useCallback(
    (title: string) => {
      setOpen(false);
      setCreated(title);
      // The action already called revalidatePath("/admin"); this makes sure
      // this client picks the new payload up so the row appears in the table
      // without a full page load.
      router.refresh();
    },
    [router]
  );

  // Moved to, not just rendered, so the confirmation is not missed on a long
  // list where the alert would otherwise be off-screen.
  useEffect(() => {
    if (created) alertRef.current?.focus();
  }, [created]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setCreated(null);
          setOpen(true);
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-acorn-gold px-5 py-2.5 font-heading text-xs uppercase tracking-[0.15em] text-acorn-charcoal transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold"
      >
        <Plus size={16} aria-hidden="true" />
        Create New Project
      </button>

      {created && (
        <div
          ref={alertRef}
          tabIndex={-1}
          // role="status" not "alert": this is a confirmation, and alert would
          // interrupt a screen reader mid-sentence for good news.
          role="status"
          className="mt-4 flex w-full items-start gap-3 rounded-sm border border-acorn-gold/50 bg-acorn-stone px-4 py-3 text-sm text-acorn-charcoal outline-none"
        >
          <CheckCircle2
            size={18}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-acorn-bronze"
          />
          <p className="flex-1">
            <span className="font-semibold">{created}</span> was added and is
            live on the website now.
          </p>
          <button
            type="button"
            onClick={() => setCreated(null)}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 shrink-0 rounded-sm p-1 text-acorn-charcoal/50 transition-colors hover:bg-acorn-cream hover:text-acorn-charcoal"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {open && <ProjectCreateOverlay onClose={close} onCreated={onCreated} />}
    </>
  );
}
