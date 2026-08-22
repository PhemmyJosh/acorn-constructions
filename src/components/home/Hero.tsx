"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { heroImages } from "@/data/heroImages";

const SLIDE_DURATION_MS = 5500;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  // Only slides in this set get an <Image> mounted. Starts as just the first
  // slide so the server render and the initial page load fetch one image, not
  // all of them; the rest are added as the carousel needs them.
  const [mountedSlides, setMountedSlides] = useState<number[]>([0]);

  // Tracks progress across the hero only, from the moment its top hits the
  // top of the viewport until its bottom leaves.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // The style prop is applied unconditionally so server and client render the
  // same markup; reduced motion flattens the output range instead of dropping
  // the prop, which would otherwise be a hydration mismatch.
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [1, 1.05]
  );

  const canRotate = !prefersReducedMotion && heroImages.length > 1;

  // Warm the next slide one tick after mount so the first crossfade has an
  // image ready without competing with the initial paint.
  useEffect(() => {
    if (!canRotate) return;
    const id = window.setTimeout(() => setMountedSlides((prev) => [...prev, 1]), 1200);
    return () => window.clearTimeout(id);
  }, [canRotate]);

  useEffect(() => {
    if (!canRotate) return;

    const id = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % heroImages.length;
        // Mount the slide after next so it is decoded before its turn.
        const upcoming = (next + 1) % heroImages.length;
        setMountedSlides((prev) => (prev.includes(upcoming) ? prev : [...prev, upcoming]));
        return next;
      });
    }, SLIDE_DURATION_MS);

    return () => window.clearInterval(id);
  }, [canRotate]);

  // Identical initial and end states on server and client, so there is no
  // hydration mismatch. Reduced motion is handled through the transition
  // below: a zero duration snaps content in with no perceptible movement.
  const loadIn = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[90vh] items-center overflow-hidden bg-acorn-charcoal text-acorn-cream"
    >
      <motion.div className="absolute inset-0" style={{ scale }}>
        {heroImages.map((image, index) =>
          mountedSlides.includes(index) ? (
            <motion.div
              key={image.src}
              aria-hidden="true"
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: index === activeIndex ? 1 : 0 }}
              transition={
                prefersReducedMotion ? { duration: 0 } : { duration: 1.2, ease: "easeInOut" }
              }
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="100vw"
                priority={index === 0}
                className="object-cover"
              />
            </motion.div>
          ) : null
        )}
      </motion.div>
      {/* Flat uniform tint rather than a gradient, so text legibility is the
          same wherever it sits and consistent across every slide. */}
      <div className="absolute inset-0 bg-acorn-charcoal/45" />

      <Container className="relative z-10 flex flex-col gap-6 py-32">
        <motion.h1
          {...loadIn}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
        >
          We Bring the Same Quality to Every Single Project We Build.
        </motion.h1>
        <motion.p
          {...loadIn}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut", delay: 0.22 }}
          // Full-opacity cream rather than /80: at a 45% overlay the dimmed
          // variant fell under 4.5:1 across more than half of this band on the
          // brighter slides.
          className="max-w-xl text-lg leading-relaxed text-acorn-cream sm:text-xl"
        >
          Residential, light commercial, and post frame construction built on
          craftsmanship, safety, and trust.
        </motion.p>
        <motion.div
          {...loadIn}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <Button href="/estimate" variant="primary">
            Get a Free Estimate
          </Button>
          <Link
            href="/services"
            className="flex items-center justify-center rounded-sm border border-acorn-cream/70 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-acorn-cream transition-colors duration-200 hover:bg-acorn-cream hover:text-acorn-charcoal"
          >
            See Our Services
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
