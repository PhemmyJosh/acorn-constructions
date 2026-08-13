import { Award, BadgeCheck, Scale, ShieldCheck, Target, Users } from "lucide-react";
import { ValueProp } from "@/types";

export const coreValues: ValueProp[] = [
  {
    icon: ShieldCheck,
    title: "Safety",
    description: "Everyone goes home, every day.",
  },
  {
    icon: Scale,
    title: "Integrity",
    description: "We do what's right, and we own the outcome.",
  },
  {
    icon: Target,
    title: "Ownership",
    description: "We finish what we start.",
  },
  {
    icon: Award,
    title: "Quality",
    description: "Built right the first time.",
  },
  {
    icon: Users,
    title: "Culture",
    description: "A crew worth being part of.",
  },
  {
    icon: BadgeCheck,
    title: "Reputation",
    description: "Our name is on every job.",
  },
];
