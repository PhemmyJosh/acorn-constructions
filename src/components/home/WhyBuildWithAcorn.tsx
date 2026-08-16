"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { photos } from "@/data/photos";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface SpecPoint {
  id: string;
  title: string;
  description: string;
  corner: Corner;
  anchor: { x: number; y: number };
}

// Coordinates live in a 160 x 100 unit space matching the image box's
// 16:10 aspect ratio, so lines/circles scale without distortion.
const POINTS: SpecPoint[] = [
  {
    id: "01",
    title: "34,000 Sq Ft",
    description: "Largest project to date",
    corner: "top-left",
    anchor: { x: 78, y: 30 },
  },
  {
    id: "02",
    title: "Multiple Crews, Multiple Sites",
    description: "Running simultaneous crews across projects",
    corner: "top-right",
    anchor: { x: 122, y: 44 },
  },
  {
    id: "03",
    title: "Built to Plug Into Your Project",
    description: "Seamless subcontractor handoff after excavation or foundation stage",
    corner: "bottom-left",
    anchor: { x: 48, y: 80 },
  },
  {
    id: "04",
    title: "25 Years",
    description: "Hands-on framing experience, founder-led",
    corner: "bottom-right",
    anchor: { x: 96, y: 62 },
  },
];

const CORNER_START: Record<Corner, { x: number; y: number }> = {
  "top-left": { x: 4, y: 4 },
  "top-right": { x: 156, y: 4 },
  "bottom-left": { x: 4, y: 96 },
  "bottom-right": { x: 156, y: 96 },
};

const CALLOUT_POSITION: Record<Corner, string> = {
  "top-left": "left-0 top-0 items-start text-left",
  "top-right": "right-0 top-0 items-end text-right",
  "bottom-left": "left-0 bottom-0 items-start text-left",
  "bottom-right": "right-0 bottom-0 items-end text-right",
};

function lineLength(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export default function WhyBuildWithAcorn() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      queueMicrotask(() => setIsVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-acorn-charcoal py-16 sm:py-20 lg:py-28"
    >
      {/* blueprint grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #C08A3E 1px, transparent 1px), linear-gradient(to bottom, #C08A3E 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <Container className="relative z-10">
        <SectionHeading
          eyebrow="Why Build With Acorn"
          title="Spec Sheet: The Acorn Difference"
          description="Four numbers that describe how we build, from breaking ground to final walkthrough."
          tone="dark"
          align="center"
          className="mx-auto mb-16"
        />

        {/* Desktop / large screens: annotated image */}
        <div className="hidden lg:block">
          <div className="relative mx-auto aspect-[16/10] w-full max-w-5xl">
            <div className="absolute inset-x-[16%] inset-y-[14%] overflow-hidden rounded-sm border border-acorn-gold/30">
              <Image
                src={photos.residentialFraming}
                alt="Wood-frame house under construction"
                fill
                className="object-cover"
              />
            </div>

            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 160 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {POINTS.map((point) => {
                const start = CORNER_START[point.corner];
                const length = lineLength(start, point.anchor);
                return (
                  <g key={point.id}>
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={point.anchor.x}
                      y2={point.anchor.y}
                      stroke="var(--color-acorn-gold)"
                      strokeWidth={0.35}
                      strokeDasharray="2 2"
                      style={{
                        strokeDashoffset: isVisible ? 0 : length,
                        transition: `stroke-dashoffset 1.1s ease-out`,
                      }}
                    />
                    <circle
                      cx={point.anchor.x}
                      cy={point.anchor.y}
                      r={1.1}
                      fill="var(--color-acorn-gold)"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transition: "opacity 0.4s ease-out 1s",
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {POINTS.map((point, index) => (
              <div
                key={point.id}
                className={`absolute flex w-56 flex-col gap-1 ${CALLOUT_POSITION[point.corner]}`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(6px)",
                  transition: `opacity 0.5s ease-out ${index * 120}ms, transform 0.5s ease-out ${index * 120}ms`,
                }}
              >
                <span className="font-mono text-3xl font-bold text-acorn-gold">{point.id}</span>
                <span className="text-sm font-semibold uppercase tracking-wide text-acorn-cream">
                  {point.title}
                </span>
                <span className="text-xs leading-relaxed text-acorn-cream/60">
                  {point.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile / tablet: blueprint spec list */}
        <div className="lg:hidden">
          <div className="relative mb-10 aspect-[4/3] w-full overflow-hidden rounded-sm border border-acorn-gold/30">
            <Image
              src={photos.residentialFraming}
              alt="Wood-frame house under construction"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col divide-y divide-acorn-cream/10">
            {POINTS.map((point, index) => (
              <div
                key={point.id}
                className="flex items-start gap-5 py-6"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(10px)",
                  transition: `opacity 0.5s ease-out ${index * 100}ms, transform 0.5s ease-out ${index * 100}ms`,
                }}
              >
                <span className="w-14 shrink-0 font-mono text-3xl font-bold text-acorn-gold">
                  {point.id}
                </span>
                <div className="w-px shrink-0 self-stretch border-l border-dashed border-acorn-gold/40" />
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-acorn-cream">{point.title}</h3>
                  <p className="text-sm leading-relaxed text-acorn-cream/60">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
