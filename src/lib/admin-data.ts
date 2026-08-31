/**
 * Single source of truth for the admin dashboard's three tables.
 *
 * Column names from here are interpolated into SQL (ORDER BY cannot be
 * parameterised, and neither can a table name), so nothing in this file may
 * ever be built from user input. Query-string values are matched *against*
 * these lists and fall back to a default when they do not appear.
 */

export type TabKey = "contact" | "estimate" | "careers";

export const TABS: { key: TabKey; label: string; shortLabel: string }[] = [
  { key: "contact", label: "Contact Submissions", shortLabel: "Contact" },
  { key: "estimate", label: "Estimate Requests", shortLabel: "Estimates" },
  { key: "careers", label: "Career Applications", shortLabel: "Careers" },
];

export const TABLE_NAMES: Record<TabKey, string> = {
  contact: "contact_submissions",
  estimate: "estimate_requests",
  careers: "career_applications",
};

/* -------------------------------------------------------------------------- */
/* Content tabs                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The Content tabs sit in the same tab bar as the submission tabs but are a
 * different kind of thing: editable site content rather than an inbox, with no
 * read/unread state, sorting or filtering.
 */
export type ContentTabKey = "projects" | "testimonials" | "services";

export const CONTENT_TABS: { key: ContentTabKey; label: string }[] = [
  { key: "projects", label: "Projects" },
  { key: "testimonials", label: "Testimonials" },
  { key: "services", label: "Service Copy" },
];

export function isContentTab(value: unknown): value is ContentTabKey {
  return CONTENT_TABS.some((t) => t.key === value);
}

export function toTab(value: unknown): TabKey {
  return TABS.some((t) => t.key === value) ? (value as TabKey) : "contact";
}

/* -------------------------------------------------------------------------- */
/* Read/unread filter                                                          */
/* -------------------------------------------------------------------------- */

export type ReadFilter = "all" | "unread" | "read";

export const READ_FILTERS: { key: ReadFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

export function toReadFilter(value: unknown): ReadFilter {
  return READ_FILTERS.some((f) => f.key === value)
    ? (value as ReadFilter)
    : "all";
}

/** SQL fragment for the WHERE clause. Fixed strings only, never user input. */
export function readFilterClause(filter: ReadFilter): string {
  if (filter === "unread") return "WHERE is_read = 0";
  if (filter === "read") return "WHERE is_read = 1";
  return "";
}

/* -------------------------------------------------------------------------- */
/* Columns                                                                     */
/* -------------------------------------------------------------------------- */

export type ValueFormat = "datetime" | "date" | "int" | "json" | "resume";

export interface ColumnDef {
  label: string;
  key: string;
  /** Sortable columns are the ORDER BY allowlist. */
  sortable?: boolean;
  /** Long free text: wrapped and width-capped instead of nowrap. */
  wrap?: boolean;
  format?: ValueFormat;
}

/** Columns shown in the table view, in order. */
export const LIST_COLUMNS: Record<TabKey, ColumnDef[]> = {
  contact: [
    { label: "Received", key: "created_at", sortable: true, format: "datetime" },
    { label: "Name", key: "name", sortable: true },
    { label: "Email", key: "email", sortable: true },
    { label: "Phone", key: "phone" },
    { label: "Message", key: "message", wrap: true },
  ],
  estimate: [
    { label: "Received", key: "created_at", sortable: true, format: "datetime" },
    { label: "Name", key: "name", sortable: true },
    { label: "Email", key: "email", sortable: true },
    { label: "Phone", key: "phone" },
    { label: "City", key: "city", sortable: true },
    { label: "Type", key: "building_type", sortable: true },
    { label: "Start", key: "proposed_start_date", format: "date" },
    { label: "Sq Ft", key: "building_size_sqft", format: "int" },
    { label: "Description", key: "description", wrap: true },
  ],
  careers: [
    { label: "Received", key: "created_at", sortable: true, format: "datetime" },
    { label: "Name", key: "name", sortable: true },
    { label: "Email", key: "email", sortable: true },
    { label: "Phone", key: "phone" },
    { label: "Experience", key: "years_experience", sortable: true },
    // Ahead of the free-text columns: a long comment must never be what pushes
    // the download link off the right edge of the table.
    { label: "Resume", key: "resume_filename", format: "resume" },
    { label: "Proficient In", key: "proficiencies", wrap: true, format: "json" },
    { label: "Comments", key: "comments", wrap: true },
  ],
};

/** Every field shown in the full detail view, in order. */
export const DETAIL_FIELDS: Record<TabKey, ColumnDef[]> = {
  contact: [
    { label: "Received", key: "created_at", format: "datetime" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Message", key: "message", wrap: true },
  ],
  estimate: [
    { label: "Received", key: "created_at", format: "datetime" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Mailing address", key: "mailing_address" },
    { label: "City", key: "city" },
    { label: "Province / region", key: "province" },
    { label: "Postal code", key: "postal_code" },
    { label: "Country", key: "country" },
    { label: "Building type", key: "building_type" },
    { label: "Building location", key: "building_location" },
    { label: "Proposed start date", key: "proposed_start_date", format: "date" },
    { label: "Approximate size (sq ft)", key: "building_size_sqft", format: "int" },
    { label: "Description", key: "description", wrap: true },
    { label: "Additional comments", key: "comments", wrap: true },
  ],
  careers: [
    { label: "Received", key: "created_at", format: "datetime" },
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    { label: "Years of experience", key: "years_experience" },
    { label: "Available to start", key: "start_date" },
    { label: "Expected wage", key: "expected_wage" },
    { label: "Proficient in", key: "proficiencies", wrap: true, format: "json" },
    { label: "Comments", key: "comments", wrap: true },
    { label: "Resume", key: "resume_filename", format: "resume" },
  ],
};

/**
 * Fields shown on the mobile card for each tab, under the client's name.
 *
 * A narrow screen cannot show a nine-column table without horizontal
 * scrolling, so below the md breakpoint the table is replaced by these cards.
 * Deliberately a shorter list than LIST_COLUMNS: the point is a scannable
 * summary, with everything else one tap away in the detail view.
 */
export const CARD_FIELDS: Record<TabKey, ColumnDef[]> = {
  contact: [
    { label: "Received", key: "created_at", format: "datetime" },
    { label: "Phone", key: "phone" },
    { label: "Email", key: "email" },
    { label: "Message", key: "message", wrap: true },
  ],
  estimate: [
    { label: "Received", key: "created_at", format: "datetime" },
    { label: "Type", key: "building_type" },
    { label: "Location", key: "building_location" },
    { label: "Description", key: "description", wrap: true },
  ],
  careers: [
    { label: "Received", key: "created_at", format: "datetime" },
    { label: "Comments", key: "comments", wrap: true },
    { label: "Resume", key: "resume_filename", format: "resume" },
  ],
};

export function sortableColumns(tab: TabKey): string[] {
  return LIST_COLUMNS[tab].filter((c) => c.sortable).map((c) => c.key);
}

export function toSort(tab: TabKey, value: unknown): string {
  return typeof value === "string" && sortableColumns(tab).includes(value)
    ? value
    : "created_at";
}

export function toDir(value: unknown): "ASC" | "DESC" {
  return value === "asc" ? "ASC" : "DESC";
}

/**
 * How many characters of a long free-text field the table view fetches.
 *
 * The visible truncation is done in CSS (two lines, with an ellipsis), so this
 * is purely a guard on what crosses the wire and lands in the DOM: a
 * several-thousand-character message would otherwise be sent in full to render
 * two lines of it. Comfortably more than two lines can ever show, so it never
 * decides what the reader sees.
 */
export const LIST_TEXT_CHARS = 200;

/**
 * Columns for the table view.
 *
 * Explicit rather than `*` so that free-text fields can be cut down in SQL,
 * and so the careers table's resume BLOB is never pulled into a list query —
 * it is streamed on demand by /api/admin/resume/[id] instead.
 *
 * JSON columns are exempt from the cut: slicing them mid-array would leave
 * something JSON.parse cannot read. Those are bounded by a fixed set of
 * checkboxes, not free text, so they need no guard.
 */
export function listSelectColumns(tab: TabKey): string {
  const needed = new Set<string>(["id", "is_read", "read_at"]);
  const selected: string[] = [];
  const seen = new Set<string>();

  // Union of the desktop table columns and the mobile card fields: one query
  // serves both, since which one renders is decided in CSS.
  for (const column of [...LIST_COLUMNS[tab], ...CARD_FIELDS[tab]]) {
    if (seen.has(column.key)) continue;
    seen.add(column.key);
    needed.delete(column.key);
    if (column.wrap && column.format !== "json") {
      selected.push(`LEFT(${column.key}, ${LIST_TEXT_CHARS}) AS ${column.key}`);
    } else {
      selected.push(column.key);
    }
  }

  return [...needed, ...selected].join(", ");
}

/**
 * Columns for the detail view: everything, untruncated, so the full message is
 * what the reader gets. Only the resume BLOB is held back.
 */
export function detailSelectColumns(tab: TabKey): string {
  if (tab !== "careers") return "*";
  return [
    "id",
    "name",
    "email",
    "phone",
    "years_experience",
    "start_date",
    "expected_wage",
    "proficiencies",
    "comments",
    "resume_filename",
    "resume_mimetype",
    "is_read",
    "read_at",
    "created_at",
  ].join(", ");
}

/* -------------------------------------------------------------------------- */
/* Row shape and formatting                                                    */
/* -------------------------------------------------------------------------- */

export type SubmissionRow = {
  id: number;
  name: string;
  email: string;
  is_read: number;
  read_at: string | null;
  created_at: string;
} & Record<string, string | number | null>;

/** `dateStrings: true` keeps TIMESTAMP as 'YYYY-MM-DD HH:MM:SS'. */
export function formatValue(
  value: string | number | null | undefined,
  format?: ValueFormat
): string {
  if (value === null || value === undefined || value === "") return "—";

  switch (format) {
    case "datetime":
      return String(value).replace("T", " ").slice(0, 16);
    case "int":
      return typeof value === "number"
        ? value.toLocaleString()
        : String(value);
    case "json":
      try {
        const parsed: unknown = JSON.parse(String(value));
        return Array.isArray(parsed) ? parsed.join(", ") : String(value);
      } catch {
        return String(value);
      }
    default:
      return String(value);
  }
}
