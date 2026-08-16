import { ExternalLink } from "lucide-react";
import { company } from "@/data/company";

const mapQuery = `${company.address.line1}, ${company.address.cityStateZip}, Canada`;
const encodedQuery = encodeURIComponent(mapQuery);

// Google's keyless embed endpoint, so no API key or billing account is needed.
const embedSrc = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodedQuery}`;

export default function LocationMap() {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-acorn-bronze/20">
        <iframe
          title={`Map showing ${company.legalName} at ${mapQuery}`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <a
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-acorn-gold transition-colors duration-200 hover:text-acorn-bronze"
      >
        Get directions
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    </div>
  );
}
