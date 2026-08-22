import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  HardHat,
  Inbox,
  MessageSquare,
  Sun,
} from "lucide-react";
import type { DashboardStats } from "@/lib/admin-stats";

/**
 * Compact at-a-glance summary above the tabs.
 *
 * Deliberately small: this is a header, not the content. Two columns on phones,
 * three on tablets, six across on desktop, so it never scrolls sideways and
 * never pushes the tables far down the page.
 */
export default function StatsOverview({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      key: "total",
      label: "Total messages",
      value: stats.total,
      icon: Inbox,
      unread: stats.totalUnread,
      href: null,
    },
    {
      key: "contact",
      label: "Contact inquiries",
      value: stats.contact.total,
      icon: MessageSquare,
      unread: stats.contact.unread,
      href: "contact" as const,
    },
    {
      key: "estimate",
      label: "Estimate requests",
      value: stats.estimate.total,
      icon: ClipboardList,
      unread: stats.estimate.unread,
      href: "estimate" as const,
    },
    {
      key: "careers",
      label: "Career applications",
      value: stats.careers.total,
      icon: HardHat,
      unread: stats.careers.unread,
      href: "careers" as const,
    },
    {
      key: "week",
      label: "New this week",
      value: stats.newThisWeek,
      icon: CalendarDays,
      unread: null,
      href: null,
    },
    {
      key: "today",
      label: "New today",
      value: stats.newToday,
      icon: Sun,
      unread: null,
      href: null,
    },
  ];

  return (
    <section
      aria-label="Summary"
      // min-w-0 on the grid and on every card: grid items default to
      // min-width:auto, so without it the widest card's min-content width
      // stretches this section — and with it the shared max-w-7xl parent —
      // past the viewport. That in turn widens the table's overflow-x-auto
      // wrapper, so the whole page scrolls sideways instead of just the table.
      className="mt-6 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      {cards.map((card) => {
        const Icon = card.icon;

        const body = (
          <>
            <div className="flex items-start justify-between gap-2">
              <span className="font-heading text-2xl leading-none text-acorn-charcoal">
                {card.value.toLocaleString()}
              </span>
              <Icon
                size={16}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-acorn-bronze/70"
              />
            </div>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-acorn-charcoal/65">
              {card.label}
            </p>
            {card.unread !== null && (
              <p className="mt-1 text-[11px] text-acorn-charcoal/55">
                {card.unread > 0 ? (
                  <span className="font-semibold text-acorn-rust">
                    {card.unread} unread
                  </span>
                ) : (
                  "all read"
                )}
              </p>
            )}
          </>
        );

        const shell =
          "min-w-0 rounded-sm border border-acorn-bronze/20 bg-white px-4 py-3";

        // Cards for a specific type jump to that tab. With unread entries
        // waiting, they land on the unread filter — that is what the number is
        // drawing attention to.
        if (!card.href) {
          return (
            <div key={card.key} className={shell}>
              {body}
            </div>
          );
        }

        const params = new URLSearchParams({ tab: card.href });
        if (card.unread && card.unread > 0) params.set("read", "unread");

        return (
          <Link
            key={card.key}
            href={`/admin?${params.toString()}`}
            className={`${shell} block transition-colors hover:border-acorn-gold hover:bg-acorn-stone/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acorn-gold`}
          >
            {body}
          </Link>
        );
      })}
    </section>
  );
}
