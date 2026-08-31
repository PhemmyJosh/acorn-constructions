"use client";

import { useCallback, useState } from "react";
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

  const close = useCallback(() => setActiveIndex(null), []);
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

      <MasonryGrid projects={filtered} onSelect={setActiveIndex} />

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
