import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { services } from "@/data/services";
import { getServiceContentRows } from "@/lib/content-data";
import { saveServiceContent } from "../content-actions";
import { fieldClasses, panelClasses, primaryButton } from "./styles";

/**
 * Services tab: exactly one editor per service defined in src/data/services.ts.
 *
 * The service list itself stays in code — slugs are routes, and each service
 * also carries an icon, benefit list and hero image. Only the overview copy is
 * editable here, which is the part the client actually needs to reword.
 */
export default async function ServicesPanel() {
  const rows = await getServiceContentRows();
  const bySlug = new Map(rows.map((row) => [row.service_slug, row]));

  return (
    <div className="mt-4 flex flex-col gap-6">
      {services.map((service) => {
        const row = bySlug.get(service.slug);
        // Falls back to the copy compiled into the site, so the editor always
        // opens showing what the page currently displays.
        const value = row?.overview_text ?? service.description.join("\n\n");

        return (
          <form
            key={service.slug}
            action={saveServiceContent}
            className={panelClasses}
          >
            <input type="hidden" name="service_slug" value={service.slug} />

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg uppercase tracking-wide text-acorn-charcoal">
                  {service.title}
                </h3>
                <p className="mt-1 font-mono text-xs text-acorn-charcoal/50">
                  /services/{service.slug}
                </p>
              </div>

              <Link
                href={`/services/${service.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-acorn-rust hover:underline"
              >
                View page
                <ExternalLink size={13} aria-hidden="true" />
              </Link>
            </div>

            <label
              htmlFor={`overview-${service.slug}`}
              className="mt-4 block text-sm font-semibold text-acorn-charcoal"
            >
              Overview copy
            </label>
            <textarea
              id={`overview-${service.slug}`}
              name="overview_text"
              rows={7}
              defaultValue={value}
              className={`mt-2 w-full ${fieldClasses}`}
            />
            <p className="mt-2 text-xs text-acorn-charcoal/60">
              Leave a blank line between paragraphs — each block becomes its own
              paragraph on the page.
              {!row && " (Not saved yet: showing the site's built-in copy.)"}
            </p>

            <button type="submit" className={`${primaryButton} mt-4`}>
              <Save size={14} aria-hidden="true" />
              Save
            </button>
          </form>
        );
      })}
    </div>
  );
}
