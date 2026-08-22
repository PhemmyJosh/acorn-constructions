import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
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

// PLACEHOLDER: set metadataBase to the production domain once the client
// provides one, so relative OG/icon URLs below resolve correctly when shared.
export const metadata: Metadata = {
  title: "Acorn Construction | Residential, Commercial & Post Frame Builders",
  description:
    "Acorn Construction Ltd. is a Lloydminster, Alberta-based builder delivering residential, light commercial, and post frame construction since 2011.",
  icons: {
    icon: "/acorn-logo.png",
    shortcut: "/acorn-logo.png",
    apple: "/acorn-logo.png",
  },
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
