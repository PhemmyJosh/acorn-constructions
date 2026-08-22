import { query } from "@/lib/db";
import { TABLE_NAMES } from "@/lib/admin-data";

export interface TypeStats {
  total: number;
  unread: number;
}

export interface DashboardStats {
  total: number;
  totalUnread: number;
  contact: TypeStats;
  estimate: TypeStats;
  careers: TypeStats;
  newThisWeek: number;
  newToday: number;
}

interface StatsRow {
  contact_total: number;
  contact_unread: number;
  estimate_total: number;
  estimate_unread: number;
  careers_total: number;
  careers_unread: number;
  week_total: number;
  today_total: number;
}

/**
 * Every dashboard number in one round trip.
 *
 * Scalar subqueries rather than one query per card: this is eight aggregates in
 * a single statement, so the page cost stays flat as submission volume grows.
 * Nothing here fetches rows — only COUNT(*) — and the created_at ranges use the
 * idx_*_created_at indexes already defined in schema.sql.
 *
 * "This week" is a rolling seven days rather than a calendar week, so the
 * number never resets to near-zero every Monday. "Today" is from local midnight
 * as MySQL sees it, which matches how created_at was written.
 */
export async function dashboardStats(): Promise<DashboardStats> {
  const rows = await query<StatsRow>(
    `SELECT
       (SELECT COUNT(*) FROM ${TABLE_NAMES.contact})                     AS contact_total,
       (SELECT COUNT(*) FROM ${TABLE_NAMES.contact}  WHERE is_read = 0)  AS contact_unread,
       (SELECT COUNT(*) FROM ${TABLE_NAMES.estimate})                    AS estimate_total,
       (SELECT COUNT(*) FROM ${TABLE_NAMES.estimate} WHERE is_read = 0)  AS estimate_unread,
       (SELECT COUNT(*) FROM ${TABLE_NAMES.careers})                     AS careers_total,
       (SELECT COUNT(*) FROM ${TABLE_NAMES.careers}  WHERE is_read = 0)  AS careers_unread,
       (
         (SELECT COUNT(*) FROM ${TABLE_NAMES.contact}  WHERE created_at >= NOW() - INTERVAL 7 DAY) +
         (SELECT COUNT(*) FROM ${TABLE_NAMES.estimate} WHERE created_at >= NOW() - INTERVAL 7 DAY) +
         (SELECT COUNT(*) FROM ${TABLE_NAMES.careers}  WHERE created_at >= NOW() - INTERVAL 7 DAY)
       ) AS week_total,
       (
         (SELECT COUNT(*) FROM ${TABLE_NAMES.contact}  WHERE created_at >= CURDATE()) +
         (SELECT COUNT(*) FROM ${TABLE_NAMES.estimate} WHERE created_at >= CURDATE()) +
         (SELECT COUNT(*) FROM ${TABLE_NAMES.careers}  WHERE created_at >= CURDATE())
       ) AS today_total`
  );

  const row = rows[0];
  const n = (value: number | undefined) => Number(value ?? 0);

  const contact = {
    total: n(row?.contact_total),
    unread: n(row?.contact_unread),
  };
  const estimate = {
    total: n(row?.estimate_total),
    unread: n(row?.estimate_unread),
  };
  const careers = {
    total: n(row?.careers_total),
    unread: n(row?.careers_unread),
  };

  return {
    contact,
    estimate,
    careers,
    // Summed here rather than in SQL: the parts are already in hand.
    total: contact.total + estimate.total + careers.total,
    totalUnread: contact.unread + estimate.unread + careers.unread,
    newThisWeek: n(row?.week_total),
    newToday: n(row?.today_total),
  };
}
