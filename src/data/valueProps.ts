import { Award, Clock, HandCoins, ShieldCheck } from "lucide-react";
import { ValueProp } from "@/types";

export const valueProps: ValueProp[] = [
  {
    icon: Award,
    title: "Quality Craftsmanship",
    description:
      "Every project is built by licensed tradespeople who take pride in the details, not just the deadline.",
  },
  {
    icon: ShieldCheck,
    title: "Licensed & Insured",
    description:
      "Fully licensed, bonded, and insured, so you can move forward with confidence from day one.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description:
      "We build realistic schedules and hold ourselves to them, with clear updates at every milestone.",
  },
  {
    icon: HandCoins,
    title: "Transparent Pricing",
    description:
      "Detailed estimates and no hidden change orders, so the number we quote is the number you pay.",
  },
];
