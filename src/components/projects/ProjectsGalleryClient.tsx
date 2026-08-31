"use client";

import { useCallback, useRef, useState } from "react";
import MasonryGrid from "./MasonryGrid";
import Lightbox from "./Lightbox";
import { Project, ProjectCategory } from "@/types";

interface ProjectsGalleryClientProps {
  projects: Project[];
}

/** The order tabs appear in, when the projects actually use them. */
const CATEGORY_ORDER: ProjectCategory[] = [
  "Residential",
  "Commercial",
  "Foundations",
  "Post Frame",
];

export default function ProjectsGalleryClient({ projects }: ProjectsGalleryClientProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | "All">("All");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Derived from the projects rather than hardcoded: the client can now add
  // categories from the admin, and a tab that would show nothing (Commercial,
  // until there is a commercial project) should not appear at all.
  const present = new Set(projects.map((project) => project.category));
  const CATEGORIES: Array<ProjectCategory | "All"> = [
    "All",
    ...CATEGORY_ORDER.filter((category) => present.has(category)),
  ];

  const filtered =
    activeCategory === "All" ? projects : projects.filter((project) => project.category === activeCategory);
  const total = filtered.length;

  // The thumbnail that opened the lightbox, so focus can go back to it.
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((index: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setActiveIndex(index);
  }, []);

  const close = useCallback(() => {
    setActiveIndex(null);
    // The tile is still mounted behind the lightbox, so this is safe to do
    // synchronously; if it has gone (a category switch, say) focus simply
    // stays where the browser left it.
    triggerRef.current?.focus();
  }, []);
  const showPrev = useCallback(
    () => setActiveIndex((current) => (current === null ? null : (current - 1 + total) % total)),
    [total]
  );
  const showNext = useCallback(
    () => setActiveIndex((current) => (current === null ? null : (current + 1) % total)),
    [total]
  );

  function selectCategory(category: ProjectCategory | "All") {
    setActiveCategory(category);
    setActiveIndex(null);
    // The tiles are about to be replaced, so the remembered one is stale.
    triggerRef.current = null;
  }

  return (
    <>
      <div className="mb-12 flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => selectCategory(category)}
            className={`rounded-full border px-5 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
              activeCategory === category
                ? "border-acorn-charcoal bg-acorn-charcoal text-acorn-cream"
                : "border-acorn-charcoal/30 text-acorn-charcoal hover:border-acorn-charcoal"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <MasonryGrid projects={filtered} onSelect={open} />

      {activeIndex !== null ? (
        <Lightbox
          project={filtered[activeIndex]}
          onClose={close}
          onPrev={showPrev}
          onNext={showNext}
        />
      ) : null}
    </>
  );
}
