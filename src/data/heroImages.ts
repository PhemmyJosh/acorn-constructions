/**
 * Hero carousel slides, served from public/hero.
 *
 * Filenames are listed explicitly rather than generated, since the folder
 * mixes .jpeg and .jpg extensions. Add or remove entries here to change how
 * many slides the hero rotates through; one entry renders a static hero.
 */
export interface HeroImage {
  src: string;
}

export const heroImages: HeroImage[] = [
  { src: "/hero/project-1.jpeg" },
  { src: "/hero/project-2.jpeg" },
  { src: "/hero/project-3.jpg" },
  { src: "/hero/project-4.jpg" },
  { src: "/hero/project-5.jpeg" },
  { src: "/hero/project-6.jpg" },
];
