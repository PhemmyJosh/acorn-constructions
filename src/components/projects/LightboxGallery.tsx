"use client";

import { useCallback, useRef, useState } from "react";
import MasonryGrid from "./MasonryGrid";
import Lightbox from "./Lightbox";
import { Project } from "@/types";

/**
 * A masonry grid whose tiles open the lightbox, scoped to whatever set it is
 * given.
 *
 * Extracted so the home page preview and the /projects page share one
 * implementation instead of two. That scoping matters for the arrow keys: they
 * cycle the set on screen, so on the home page they move through the six
 * previewed projects rather than the full gallery the visitor cannot see.
 *
 * Reset by remounting with a new `key` when the set changes — /projects does
 * that on a category switch, which clears both the open index and the
 * remembered tile in one step.
 */
export default function LightboxGallery({
  projects,
  className = "",
}: {
  projects: Project[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = projects.length;

  // The thumbnail that opened the lightbox, so focus can go back to it.
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((index: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setActiveIndex(index);
  }, []);

  const close = useCallback(() => {
    setActiveIndex(null);
    // The tile is still mounted behind the lightbox, so this is safe to do
    // synchronously; if it has gone, focus simply stays where the browser
    // left it. Closing never navigates — the page stays exactly as it was.
    triggerRef.current?.focus();
  }, []);

  const showPrev = useCallback(
    () =>
      setActiveIndex((current) =>
        current === null ? null : (current - 1 + total) % total
      ),
    [total]
  );

  const showNext = useCallback(
    () =>
      setActiveIndex((current) =>
        current === null ? null : (current + 1) % total
      ),
    [total]
  );

  return (
    <>
      <MasonryGrid projects={projects} onSelect={open} className={className} />

      {activeIndex !== null ? (
        <Lightbox
          project={projects[activeIndex]}
          onClose={close}
          onPrev={showPrev}
          onNext={showNext}
        />
      ) : null}
    </>
  );
}
