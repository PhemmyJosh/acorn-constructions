import {
  IconClipboardCheck,
  IconClipboardList,
  IconHammer,
  IconKey,
  IconUsers,
} from "@tabler/icons-react";
import { Icon } from "@tabler/icons-react";

export interface ProcessStep {
  title: string;
  description: string;
  icon: Icon;
}

export const processSteps: ProcessStep[] = [
  {
    title: "Initial Scope Review",
    description: "Reviewing drawings, scope, and site conditions before work begins.",
    icon: IconClipboardList,
  },
  {
    title: "Material & Crew Planning",
    description: "Scheduling crews and ordering materials to keep the job moving.",
    icon: IconUsers,
  },
  {
    title: "Framing & Construction",
    description: "Framing built to plan, with daily progress and safety checks.",
    icon: IconHammer,
  },
  {
    title: "Quality Walkthrough",
    description: "A final walkthrough to confirm every detail meets our standard.",
    icon: IconClipboardCheck,
  },
  {
    title: "Handover",
    description: "Documentation handed off and the job complete, on schedule.",
    icon: IconKey,
  },
];
