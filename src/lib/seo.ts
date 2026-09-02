import type { Metadata } from "next";
import { company } from "@/data/company";

/**
 * Builds one page's metadata.
 *
 * Every page had a title and description already, but they were near-identical
 * to each other and said nothing about where the work happens — which is the
 * one thing a local contractor's search result has to carry. These are written
 * per page and the brand suffix, canonical URL and social tags are assembled
 * here so a new page cannot quietly ship with none of them.
 *
 * `title` is the page-specific part only; the company name is appended. Aim to
 * keep the finished string near 60 characters, which is roughly where Google
 * truncates, and the description between 120 and 160.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  /** Page-specific part of the title, without the company name. */
  title: string;
  description: string;
  /** Site-root-relative path, e.g. "/about". Used for the canonical URL. */
  path: string;
}): Metadata {
  const fullTitle = `${title} | ${company.name}`;

  return {
    title: fullTitle,
    description,
    // Tells a crawler which URL is the real one for this content, so a link
    // arriving with a tracking parameter on it does not read as a second page
    // with duplicate copy.
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: company.legalName,
      locale: "en_CA",
      type: "website",
      images: ["/acorn-logo.png"],
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
      images: ["/acorn-logo.png"],
    },
  };
}
