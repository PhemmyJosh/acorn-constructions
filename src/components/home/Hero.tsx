"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { photos } from "@/data/photos";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Tracks progress across the hero only, from the moment its top hits the
  // top of the viewport until its bottom leaves.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const loadIn = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[90vh] items-center overflow-hidden bg-acorn-charcoal text-acorn-cream"
    >
      <motion.div
        className="absolute inset-0"
        style={prefersReducedMotion ? undefined : { scale }}
      >
        <Image
          src={photos.trussInterior}
          alt="Wood frame roof structure under construction"
          fill
          priority
          className="object-cover opacity-50"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-acorn-charcoal via-acorn-charcoal/70 to-acorn-charcoal/30" />

      <Container className="relative z-10 flex flex-col gap-6 py-32">
        <motion.h1
          {...loadIn}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
        >
          We Bring the Same Quality to Every Single Project We Build.
        </motion.h1>
        <motion.p
          {...loadIn}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.22 }}
          className="max-w-xl text-lg leading-relaxed text-acorn-cream/80 sm:text-xl"
        >
          Residential, light commercial, and post frame construction built on
          craftsmanship, safety, and trust.
        </motion.p>
        <motion.div
          {...loadIn}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <Button href="/contact" variant="primary">
            Get a Quote
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
