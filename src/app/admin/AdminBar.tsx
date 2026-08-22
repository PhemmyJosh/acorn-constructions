import { logout } from "./actions";

/**
 * Admin title bar with the combined unread total.
 *
 * Rendered by the page rather than the layout: layouts are reused across
 * client-side navigations that only change search params, so a count rendered
 * there goes stale as soon as an entry is opened or marked unread. Rendering it
 * with the page keeps the total in step with the tab badges.
 */
export default function AdminBar({
  authed,
  unread,
}: {
  authed: boolean;
  /** null when the count could not be read (database unreachable). */
  unread: number | null;
}) {
  return (
    <header className="border-b border-acorn-bronze/20 bg-acorn-charcoal">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <span className="font-heading text-sm uppercase tracking-[0.2em] text-acorn-cream">
          Acorn Construction
          <span className="text-acorn-gold"> — Admin</span>
        </span>

        {authed && (
          <div className="flex items-center gap-4">
            {unread !== null && (
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  unread > 0
                    ? "bg-acorn-gold text-acorn-charcoal"
                    : "border border-acorn-cream/25 text-acorn-cream/70"
                }`}
              >
                {unread > 0 ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-acorn-charcoal"
                    />
                    {unread} new
                  </>
                ) : (
                  "All read"
                )}
              </span>
            )}

            <form action={logout}>
              <button
                type="submit"
                className="rounded-sm border border-acorn-cream/30 px-3 py-1.5 font-heading text-xs whitespace-nowrap uppercase tracking-[0.15em] text-acorn-cream transition-colors hover:border-acorn-gold hover:text-acorn-gold"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
