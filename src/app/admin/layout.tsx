import type { Metadata } from "next";
import { isAuthenticated } from "@/lib/admin-auth";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Admin | Acorn Construction",
  robots: { index: false, follow: false },
};

// Reads the session cookie to decide whether to show the sign-out control.
export const dynamic = "force-dynamic";

/**
 * Bare chrome for the internal dashboard: a title bar and a sign-out link, and
 * nothing else. Deliberately outside the `(site)` route group, so none of the
 * public nav, phone number, estimate CTA or marketing footer render here.
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authed = await isAuthenticated();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-acorn-cream">
      <header className="border-b border-acorn-bronze/20 bg-acorn-charcoal">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <span className="font-heading text-sm uppercase tracking-[0.2em] text-acorn-cream">
            Acorn Construction
            <span className="text-acorn-gold"> — Admin</span>
          </span>

          {authed && (
            <form action={logout}>
              <button
                type="submit"
                className="rounded-sm border border-acorn-cream/30 px-3 py-1.5 font-heading text-xs whitespace-nowrap uppercase tracking-[0.15em] text-acorn-cream transition-colors hover:border-acorn-gold hover:text-acorn-gold"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </header>

      {/* The public <main> lives in (site)/layout.tsx, which does not wrap
          /admin — so the landmark has to be provided here. */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
