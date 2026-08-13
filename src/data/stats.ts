import { company } from "@/data/company";

export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: `${new Date().getFullYear() - company.founded}+`, label: "Years Building" },
  { value: "34,000 sq ft", label: "Largest Project" },
  { value: "2", label: "Provinces Served" },
  { value: "100%", label: "Owner-Involved" },
];
