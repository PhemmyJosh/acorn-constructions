import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Section from "@/components/ui/Section";
import { team } from "@/data/team";

export default function LeadershipTeaser() {
  const founder = team[0];

  return (
    <Section tone="light">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Headshot is a placeholder (PLACEHOLDER_HEADSHOT) pending a real photo from the client */}
        <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-sm">
          <Image src={founder.image} alt={founder.name} fill className="object-cover" />
        </div>
        <div className="flex flex-col items-start gap-5">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
            Leadership
          </span>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Led by a Red Seal carpenter who still shows up on site
          </h2>
          <p className="text-base leading-relaxed text-stone-600 sm:text-lg">
            {founder.shortBio}
          </p>
          <p className="text-sm font-semibold text-stone-900">
            {founder.name}, {founder.role}
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-950 transition-colors hover:text-amber-600"
          >
            Meet the full leadership team
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </Section>
  );
}
