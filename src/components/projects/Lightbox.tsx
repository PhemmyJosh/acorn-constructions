import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Project } from "@/types";

interface LightboxProps {
  project: Project;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ project, onClose, onPrev, onNext }: LightboxProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-acorn-charcoal/95 p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full text-acorn-cream transition-colors hover:bg-acorn-cream/10"
      >
        <X size={24} />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
        aria-label="Previous project"
        className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-acorn-cream transition-colors hover:bg-acorn-cream/10 sm:left-6"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        aria-label="Next project"
        className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-acorn-cream transition-colors hover:bg-acorn-cream/10 sm:right-6"
      >
        <ChevronRight size={28} />
      </button>

      <div
        className="relative flex w-full max-w-4xl flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm">
          <Image src={project.image} alt={project.alt} fill className="object-cover" />
        </div>
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-acorn-gold">
            {project.category}
          </span>
          <p className="text-lg font-semibold text-acorn-cream">{project.title}</p>
        </div>
      </div>
    </div>
  );
}
