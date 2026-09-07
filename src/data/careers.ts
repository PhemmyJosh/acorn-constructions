import {
  GraduationCap,
  HandCoins,
  HardHat,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ValueProp } from "@/types";

export const whyWorkWithUs: ValueProp[] = [
  {
    icon: HandCoins,
    title: "Competitive Wages",
    description: "We pay competitive wages for skilled trade work.",
  },
  {
    icon: GraduationCap,
    title: "Growth & Training",
    description: "Opportunities to grow, with hands-on training on the job.",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    description: "A safety-first culture. Everyone goes home, every day.",
  },
  {
    icon: Layers,
    title: "Varied Projects",
    description:
      "Work across single-family homes, large commercial builds, and post frame structures.",
  },
  {
    icon: Users,
    title: "Team Environment",
    description: "Multiple crews working together in a collaborative environment.",
  },
  {
    icon: HardHat,
    title: "Founder-Led",
    description: "Led by a founder with 25 years of hands-on trade experience.",
  },
];

// The form's "Areas of Expertise" options live in `src/lib/careers-constants.ts`
// rather than here, so the API route can validate against the same list without
// importing this module's lucide icons.

/** Resume upload limit, matching the helper text shown next to the field. */
export const RESUME_MAX_MB = 2.4;
export const RESUME_MAX_BYTES = RESUME_MAX_MB * 1024 * 1024;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";
