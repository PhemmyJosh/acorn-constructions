"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, Plus, X } from "lucide-react";
import ProjectOverlay from "./ProjectOverlay";
import { type ProjectRow } from "@/lib/content-constants";

/**
 * Owns the one project overlay for the whole Projects tab, so the "Create New
 * Project" button in the header and the pencil on each row open the same
 * panel.
 *
 * A context rather than one component per trigger, because the trigger and the
 * confirmation that follows it live in different parts of a server-rendered
 * table: the pencil is inside a cell, while the confirmation belongs at the
 * top of the tab. Putting the state here lets the server component place each
 * piece where it should go.
 */

interface OverlayContext {
  /** Pass a row to edit it, or nothing to create. */
  open: (project?: ProjectRow) => void;
  saved: { title: string; mode: "created" | "updated" } | null;
  dismissSaved: () => void;
}

const Context = createContext<OverlayContext | null>(null);

function useOverlay(): OverlayContext {
  const context = useContext(Context);
  if (!context) {
    throw new Error("Project overlay triggers must be inside ProjectOverlayProvider.");
  }
  return context;
}

export default function ProjectOverlayProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  // undefined = closed. null = open for a new project. A row = editing it.
  const [editing, setEditing] = useState<ProjectRow | null | undefined>(undefined);
  const [saved, setSaved] = useState<OverlayContext["saved"]>(null);
  // Where focus came from, so it can be handed back on close.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const open = useCallback((project?: ProjectRow) => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setSaved(null);
    setEditing(project ?? null);
  }, []);

  const close = useCallback(() => {
    setEditing(undefined);
    // Back to the button that opened the panel, so a keyboard user is not
    // dropped at the top of the document.
    returnFocusRef.current?.focus();
  }, []);

  const onSaved = useCallback(
    (title: string, mode: "created" | "updated") => {
      setEditing(undefined);
      setSaved({ title, mode });
      returnFocusRef.current?.focus();
      // The action already called revalidatePath("/admin"); this makes sure
      // this client picks the new payload up, so the row appears or updates in
      // the table without a full page load.
      router.refresh();
    },
    [router]
  );

  const dismissSaved = useCallback(() => setSaved(null), []);

  return (
    <Context.Provider value={{ open, saved, dismissSaved }}>
      {children}
      {editing !== undefined && (
        <ProjectOverlay
          // Remounts when switching rows, so the fields re-initialise from the
          // new project rather than keeping the previous one's values.
          key={editing?.id ?? "new"}
          project={editing ?? undefined}
          onClose={close}
          onSaved={onSaved}
        />
      )}
    </Context.Provider>
  );
}

/** Header button for creating a project. */
export function ProjectCreateTrigger() {
  const { open } = useOverlay();
  return (
    <button
      type="button"
      onClick={() => open()}
      className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-acorn-gold px-5 py-2.5 font-heading text-xs uppercase tracking-[0.15em] text-acorn-charcoal transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold"
    >
      <Plus size={16} aria-hidden="true" />
      Create New Project
    </button>
  );
}

/**
 * Per-row edit button. Replaces the link to ?edit=<id>, which used to scroll
 * the page to a form underneath the table.
 */
export function ProjectEditTrigger({ project }: { project: ProjectRow }) {
  const { open } = useOverlay();
  return (
    <button
      type="button"
      onClick={() => open(project)}
      aria-label={`Edit ${project.title}`}
      title="Edit"
      className="rounded-sm p-1.5 text-acorn-charcoal/60 transition-colors hover:bg-acorn-stone hover:text-acorn-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold"
    >
      <Pencil size={16} aria-hidden="true" />
    </button>
  );
}

/** Confirmation shown after the overlay closes. Placed by the server panel. */
export function ProjectSaveAlert() {
  const { saved, dismissSaved } = useOverlay();
  const alertRef = useRef<HTMLDivElement>(null);

  // Moved to, not just rendered, so the confirmation is not missed on a long
  // list where it would otherwise be off-screen.
  useEffect(() => {
    if (saved) alertRef.current?.focus();
  }, [saved]);

  if (!saved) return null;

  return (
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
        <span className="font-semibold">{saved.title}</span>{" "}
        {saved.mode === "updated"
          ? "was updated and the change is live on the website now."
          : "was added and is live on the website now."}
      </p>
      <button
        type="button"
        onClick={dismissSaved}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 shrink-0 rounded-sm p-1 text-acorn-charcoal/50 transition-colors hover:bg-acorn-cream hover:text-acorn-charcoal"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
