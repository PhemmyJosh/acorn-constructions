import { MapPin } from "lucide-react";
import { company } from "@/data/company";

export default function MapPlaceholder() {
  return (
    <div
      className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-sm bg-acorn-stone"
      style={{
        backgroundImage:
          "linear-gradient(45deg, rgba(38,32,24,0.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(38,32,24,0.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(38,32,24,0.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(38,32,24,0.06) 75%)",
        backgroundSize: "32px 32px",
        backgroundPosition: "0 0, 0 16px, 16px -16px, -16px 0px",
      }}
    >
      <div className="flex flex-col items-center gap-2 rounded-sm bg-white/90 px-6 py-5 text-center shadow-sm">
        <MapPin size={28} className="text-acorn-gold" />
        <p className="text-sm font-semibold text-acorn-charcoal">Map placeholder</p>
        <p className="text-xs text-acorn-charcoal/60">
          {company.address.line1}, {company.address.cityStateZip}
        </p>
      </div>
    </div>
  );
}
