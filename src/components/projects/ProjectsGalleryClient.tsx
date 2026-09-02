"use client";

import { useState } from "react";
import LightboxGallery from "./LightboxGallery";
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

  return (
    <>
      <div className="mb-12 flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
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

      {/* Keyed on the category so switching tabs remounts the gallery: that
          clears any open lightbox and the remembered tile together, since both
          refer to tiles that no longer exist. */}
      <LightboxGallery key={activeCategory} projects={filtered} />
    </>
  );
}
