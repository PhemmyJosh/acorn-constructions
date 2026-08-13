"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Project } from "@/types";
import Lightbox from "./Lightbox";

interface ProjectGridProps {
  projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = projects.length;

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(
    () => setActiveIndex((current) => (current === null ? null : (current - 1 + total) % total)),
    [total]
  );
  const showNext = useCallback(
    () => setActiveIndex((current) => (current === null ? null : (current + 1) % total)),
    [total]
  );

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, close, showPrev, showNext]);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-[4/3] w-full overflow-hidden rounded-sm text-left"
          >
            <Image
              src={project.image}
              alt={project.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-acorn-charcoal/85 via-acorn-charcoal/10 to-transparent p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-acorn-gold">
                {project.category}
              </span>
              <span className="text-base font-semibold text-acorn-cream">{project.title}</span>
            </div>
          </button>
        ))}
      </div>

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
