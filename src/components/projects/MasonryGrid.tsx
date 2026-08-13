import Image from "next/image";
import Link from "next/link";
import { Project } from "@/types";

const ASPECT_CYCLE = [
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[3/2]",
  "aspect-[2/3]",
];

interface MasonryGridProps {
  projects: Project[];
  onSelect?: (index: number) => void;
  linkHref?: string;
  className?: string;
}

export default function MasonryGrid({
  projects,
  onSelect,
  linkHref,
  className = "",
}: MasonryGridProps) {
  return (
    <div className={`columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6 ${className}`}>
      {projects.map((project, index) => {
        const aspect = ASPECT_CYCLE[index % ASPECT_CYCLE.length];
        const content = (
          <>
            <div className={`relative w-full overflow-hidden rounded-sm ${aspect}`}>
              <Image
                src={project.image}
                alt={project.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-acorn-charcoal/80 via-acorn-charcoal/10 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-acorn-gold">
                  {project.category}
                </span>
                <span className="text-base font-semibold text-acorn-cream">{project.title}</span>
              </div>
            </div>
          </>
        );

        if (onSelect) {
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onSelect(index)}
              className="group block w-full break-inside-avoid text-left"
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={project.id}
            href={linkHref ?? "/projects"}
            className="group block w-full break-inside-avoid"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
