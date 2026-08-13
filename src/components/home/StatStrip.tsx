import Container from "@/components/ui/Container";
import { stats } from "@/data/stats";

export default function StatStrip() {
  return (
    <div className="border-b border-acorn-cream/10 bg-acorn-charcoal">
      <Container className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4 sm:gap-6 sm:py-12">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
            <span className="text-2xl font-bold text-acorn-gold sm:text-3xl">{stat.value}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-acorn-cream/70 sm:text-sm">
              {stat.label}
            </span>
          </div>
        ))}
      </Container>
    </div>
  );
}
