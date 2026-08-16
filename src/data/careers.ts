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

export interface ProficiencyGroup {
  label: string;
  options: string[];
}

export const proficiencyGroups: ProficiencyGroup[] = [
  {
    label: "Framing",
    options: [
      "Wall Building",
      "Layout & Joisting",
      "Roof Cuts",
      "Floor Sheeting",
      "Roof Sheeting",
      "Roof Building",
      "Back Framing",
    ],
  },
  {
    label: "Foundations",
    options: ["Concrete Forming", "Foundation Layout", "Footings"],
  },
  {
    label: "Post Frame",
    options: ["Post Setting", "Trussing", "Post Frame Sheeting"],
  },
];

/** Resume upload limit, matching the helper text shown next to the field. */
export const RESUME_MAX_MB = 2.4;
export const RESUME_MAX_BYTES = RESUME_MAX_MB * 1024 * 1024;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";
