import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Acorn Construction",
  robots: { index: false, follow: false },
};

/**
 * Bare chrome for the internal dashboard. Deliberately outside the `(site)`
 * route group, so none of the public nav, phone number, estimate CTA or
 * marketing footer render here.
 *
 * The title bar itself lives in AdminBar, rendered by the page: it carries the
 * unread total, and a layout is reused across search-param navigations, which
 * would leave that count stale.
 */
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-acorn-cream">
      {/* The public <main> lives in (site)/layout.tsx, which does not wrap
          /admin — so the landmark has to be provided here. */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
