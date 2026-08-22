"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Makes a whole table row open the detail view.
 *
 * The row itself is not a link — a <tr> cannot contain one, and the row also
 * holds a delete button that must not inherit the row's click. Keyboard and
 * screen-reader users get a real <Link> in the first cell instead, so this
 * onClick is a mouse convenience layered on top of an accessible path rather
 * than the only way in.
 */
export default function RowShell({
  href,
  isUnread,
  children,
}: {
  href: string;
  isUnread: boolean;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(href)}
      className={`cursor-pointer border-t border-acorn-bronze/15 align-top transition-colors ${
        isUnread
          ? "bg-acorn-gold/[0.07] hover:bg-acorn-gold/15"
          : "even:bg-acorn-cream/50 hover:bg-acorn-stone/70"
      }`}
    >
      {children}
    </tr>
  );
}
