import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { company } from "@/data/company";
import { localBusinessJsonLd } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// metadataBase is what the relative OG/Twitter image paths below resolve
// against. Without it Next.js falls back to http://localhost:3000 and every
// shared link points at an unreachable preview image.
export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: "Acorn Construction | Residential, Commercial & Post Frame Builders",
  description:
    "Acorn Construction Ltd. is a Lloydminster, Alberta-based builder delivering residential, light commercial, and post frame construction since 2011.",
  openGraph: {
    title: "Acorn Construction | Residential, Commercial & Post Frame Builders",
    description:
      "Residential, light commercial, and post frame construction since 2011.",
    images: ["/acorn-logo.png"],
  },
  twitter: {
    card: "summary",
    title: "Acorn Construction | Residential, Commercial & Post Frame Builders",
    description:
      "Residential, light commercial, and post frame construction since 2011.",
    images: ["/acorn-logo.png"],
  },
};

/**
 * Shell only: <html>/<body>, fonts and global styles.
 *
 * The public site chrome (header, footer) lives in `(site)/layout.tsx` so that
 * /admin can sit outside it with its own bare layout, rather than rendering the
 * marketing nav and CTAs around an internal tool.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* LocalBusiness structured data, in the root layout so it is on every
            page. One organisation node for the whole site: repeating it per
            page would describe the same business several times over rather
            than once authoritatively. */}
        <script
          type="application/ld+json"
          // The payload is built from our own data files and its "<" is
          // escaped in localBusinessJsonLd, so there is no untrusted input here.
          dangerouslySetInnerHTML={{ __html: localBusinessJsonLd() }}
        />
        {children}
      </body>
    </html>
  );
}
