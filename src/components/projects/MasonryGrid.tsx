"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Project } from "@/types";
import { balanceColumns } from "./balanceColumns";

/**
 * Masonry grid that balances its columns.
 *
 * It used to use CSS multi-column (`columns-3`). That fills columns in DOM
 * order against a single estimated height target, and because each tile is an
 * indivisible fixed-aspect block it overshoots: on this gallery the third
 * column ended ~845px short of the first at desktop width.
 *
 * Instead, tiles are dealt into explicit flex columns by balanceColumns, which
 * packs them for near-equal total height. No DOM measurement of the images is
 * needed — the tile aspect ratios are assigned here, so their heights are known
 * before anything loads. That also means images finishing later can never
 * re-shuffle the layout.
 */

/** Repeating tile shapes. `ratio` is width/height, matching the CSS class. */
const ASPECTS = [
  { className: "aspect-[3/4]", ratio: 3 / 4 },
  { className: "aspect-square", ratio: 1 },
  { className: "aspect-[4/5]", ratio: 4 / 5 },
  { className: "aspect-[3/2]", ratio: 3 / 2 },
  { className: "aspect-[2/3]", ratio: 2 / 3 },
];

/** Matches the Tailwind breakpoints the grid previously used. */
const SM_BREAKPOINT = 640;
const LG_BREAKPOINT = 1024;

/** gap-6 */
const GAP_PX = 24;

function columnsForWidth(width: number): number {
  if (width >= LG_BREAKPOINT) return 3;
  if (width >= SM_BREAKPOINT) return 2;
  return 1;
}

/**
 * Runs before paint on the client, so the corrected column count is what the
 * browser first shows rather than a visible reflow. Falls back to useEffect
 * during SSR, where layout effects do not run and React would warn.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface MasonryGridProps {
  projects: Project[];
  /** Receives the tile element too, so focus can be returned to it later. */
  onSelect?: (index: number, trigger: HTMLElement) => void;
  linkHref?: string;
  className?: string;
}

export default function MasonryGrid({
  projects,
  onSelect,
  linkHref,
  className = "",
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Server-rendered and first client render agree on 3 columns, so hydration
  // matches. `measured` stays false until the real width is known.
  const [columnCount, setColumnCount] = useState(3);
  const [measured, setMeasured] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    function sync() {
      const width = node!.clientWidth;
      setContainerWidth(width);
      setColumnCount(columnsForWidth(window.innerWidth));
      setMeasured(true);
    }

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Once the container has been measured the tile heights are exact pixels;
  // before that they are relative (height as a multiple of column width),
  // which balances the same way because every tile scales identically.
  const columnWidth = measured
    ? (containerWidth - GAP_PX * (columnCount - 1)) / columnCount
    : 1;

  const tileHeights = projects.map(
    (_, index) =>
      columnWidth / ASPECTS[index % ASPECTS.length].ratio +
      (measured ? GAP_PX : 0)
  );

  const columns = balanceColumns(tileHeights, columnCount);

  // Until measured, CSS carries the responsive behaviour so a no-JS or
  // pre-hydration render is still sensible: stacked below lg, 3 across above.
  const direction = measured
    ? columnCount > 1
      ? "flex-row"
      : "flex-col"
    : "flex-col lg:flex-row";

  return (
    <div
      ref={containerRef}
      data-masonry
      className={`flex gap-6 ${direction} ${className}`}
    >
      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex min-w-0 flex-1 flex-col gap-6"
        >
          {column.map((index) => {
            const project = projects[index];
            const aspect = ASPECTS[index % ASPECTS.length];
            const content = (
              <div
                className={`relative w-full overflow-hidden rounded-sm ${aspect.className}`}
              >
                <Image
                  src={project.image}
                  alt={project.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-acorn-charcoal/80 via-acorn-charcoal/10 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-acorn-gold">
                    {project.category}
                  </span>
                  <span className="text-base font-semibold text-acorn-cream">
                    {project.title}
                  </span>
                </div>
              </div>
            );

            if (onSelect) {
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={(event) => onSelect(index, event.currentTarget)}
                  className="group block w-full text-left"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={project.id}
                href={linkHref ?? "/projects"}
                className="group block w-full"
              >
                {content}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
