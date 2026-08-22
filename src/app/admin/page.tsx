import Link from "next/link";
import type { Metadata } from "next";
import { isAdminConfigured, isAuthenticated } from "@/lib/admin-auth";
import { query } from "@/lib/db";
import LoginForm from "./LoginForm";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: "Admin | Acorn Construction",
  robots: { index: false, follow: false },
};

// Reads the session cookie and live database rows on every request.
export const dynamic = "force-dynamic";

type TabKey = "contact" | "estimate" | "careers";

const TABS: { key: TabKey; label: string }[] = [
  { key: "contact", label: "Contact Submissions" },
  { key: "estimate", label: "Estimate Requests" },
  { key: "careers", label: "Career Applications" },
];

/**
 * Sortable columns per tab. Column names are interpolated into the ORDER BY
 * clause, which placeholders cannot parameterise, so only names on this list
 * are ever accepted.
 */
const SORTABLE: Record<TabKey, string[]> = {
  contact: ["created_at", "name", "email"],
  estimate: ["created_at", "name", "email", "city", "building_type"],
  careers: ["created_at", "name", "email", "years_experience"],
};

const TABLE_NAMES: Record<TabKey, string> = {
  contact: "contact_submissions",
  estimate: "estimate_requests",
  careers: "career_applications",
};

interface ContactRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

interface EstimateRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  mailing_address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: string | null;
  building_type: string | null;
  building_location: string | null;
  proposed_start_date: string | null;
  building_size_sqft: number | null;
  description: string | null;
  comments: string | null;
  created_at: string;
}

interface CareerRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  years_experience: string | null;
  start_date: string | null;
  expected_wage: string | null;
  proficiencies: string | null;
  comments: string | null;
  resume_filename: string | null;
  created_at: string;
}

type SubmissionRow = ContactRow | EstimateRow | CareerRow;

interface AdminPageProps {
  searchParams: Promise<{ tab?: string; sort?: string; dir?: string }>;
}

function formatDateTime(value: string): string {
  // dateStrings keeps TIMESTAMP columns as 'YYYY-MM-DD HH:MM:SS'.
  return value.replace("T", " ").slice(0, 16);
}

function parseProficiencies(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(", ") : value;
  } catch {
    return value;
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  if (!(await isAuthenticated())) {
    return (
      // The root layout already provides <main>, so this page uses plain
      // wrappers; the top padding clears the fixed site header.
      <div className="flex min-h-[70vh] items-center justify-center bg-acorn-cream px-6 pt-32 pb-24">
        <div className="w-full max-w-sm rounded-sm border border-acorn-bronze/20 bg-white p-8 shadow-sm">
          <h1 className="font-heading text-2xl uppercase tracking-wide text-acorn-charcoal">
            Admin Sign In
          </h1>
          <p className="mt-2 mb-6 text-sm text-acorn-charcoal/70">
            Form submissions for Acorn Construction.
          </p>
          <LoginForm configured={isAdminConfigured()} />
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const tab: TabKey = TABS.some((candidate) => candidate.key === params.tab)
    ? (params.tab as TabKey)
    : "contact";

  const sort =
    params.sort && SORTABLE[tab].includes(params.sort)
      ? params.sort
      : "created_at";
  const dir: "ASC" | "DESC" = params.dir === "asc" ? "ASC" : "DESC";

  // The careers table holds the resume BLOB, which must never be pulled into a
  // list query; it is streamed on demand by /api/admin/resume/[id] instead.
  const columns =
    tab === "careers"
      ? "id, name, email, phone, years_experience, start_date, expected_wage, proficiencies, comments, resume_filename, created_at"
      : "*";

  let rows: SubmissionRow[] = [];
  let dbError: string | null = null;
  try {
    rows = await query<SubmissionRow>(
      `SELECT ${columns} FROM ${TABLE_NAMES[tab]}
        ORDER BY ${sort} ${dir}, id ${dir}
        LIMIT 500`
    );
  } catch (error) {
    console.error("[admin] Query failed:", error);
    dbError =
      "Could not read the database. Check that MySQL is running and that the DB_* values in .env are correct.";
  }

  return (
    <div className="min-h-[70vh] bg-acorn-cream px-4 pt-28 pb-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-acorn-bronze/20 pb-6">
          <div>
            <h1 className="font-heading text-3xl uppercase tracking-wide text-acorn-charcoal">
              Form Submissions
            </h1>
            <p className="mt-1 text-sm text-acorn-charcoal/70">
              Acorn Construction Ltd. — newest first by default.
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-sm border border-acorn-bronze/40 px-4 py-2 font-heading text-xs uppercase tracking-[0.15em] text-acorn-charcoal transition-colors hover:bg-acorn-stone"
            >
              Sign out
            </button>
          </form>
        </header>

        <nav className="mt-6 flex flex-wrap gap-2">
          {TABS.map((candidate) => {
            const active = candidate.key === tab;
            return (
              <Link
                key={candidate.key}
                href={`/admin?tab=${candidate.key}`}
                className={`rounded-sm px-4 py-2 font-heading text-xs uppercase tracking-[0.15em] transition-colors ${
                  active
                    ? "bg-acorn-charcoal text-acorn-cream"
                    : "border border-acorn-bronze/30 text-acorn-charcoal hover:bg-acorn-stone"
                }`}
              >
                {candidate.label}
              </Link>
            );
          })}
        </nav>

        {dbError ? (
          <p className="mt-8 rounded-sm border border-acorn-rust/40 bg-white p-6 text-sm text-acorn-rust">
            {dbError}
          </p>
        ) : rows.length === 0 ? (
          <p className="mt-8 rounded-sm border border-acorn-bronze/20 bg-white p-6 text-sm text-acorn-charcoal/70">
            No submissions yet.
          </p>
        ) : (
          <>
            <p className="mt-6 text-xs uppercase tracking-[0.15em] text-acorn-charcoal/60">
              {rows.length} {rows.length === 1 ? "entry" : "entries"}
            </p>
            <div className="mt-3 overflow-x-auto rounded-sm border border-acorn-bronze/20 bg-white">
              {/* min-w-full rather than w-full: columns size to their content
                  and the wrapper scrolls, instead of the browser squeezing the
                  long message/comment columns down to one word per line. */}
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-acorn-stone">
                  <tr>
                    {headersFor(tab).map((header) => (
                      <SortHeader
                        key={header.label}
                        label={header.label}
                        column={header.column}
                        tab={tab}
                        activeSort={sort}
                        activeDir={dir}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-acorn-bronze/15 align-top even:bg-acorn-cream/50"
                    >
                      {tab === "contact" && <ContactCells row={row as ContactRow} />}
                      {tab === "estimate" && <EstimateCells row={row as EstimateRow} />}
                      {tab === "careers" && <CareerCells row={row as CareerRow} />}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function headersFor(tab: TabKey): { label: string; column?: string }[] {
  if (tab === "contact") {
    return [
      { label: "Received", column: "created_at" },
      { label: "Name", column: "name" },
      { label: "Email", column: "email" },
      { label: "Phone" },
      { label: "Message" },
    ];
  }
  if (tab === "estimate") {
    return [
      { label: "Received", column: "created_at" },
      { label: "Name", column: "name" },
      { label: "Email", column: "email" },
      { label: "Phone" },
      { label: "Mailing Address" },
      { label: "City", column: "city" },
      { label: "Type", column: "building_type" },
      { label: "Build Location" },
      { label: "Start" },
      { label: "Sq Ft" },
      { label: "Description" },
      { label: "Comments" },
    ];
  }
  return [
    { label: "Received", column: "created_at" },
    { label: "Name", column: "name" },
    { label: "Email", column: "email" },
    { label: "Phone" },
    { label: "Experience", column: "years_experience" },
    { label: "Can Start" },
    { label: "Expected Wage" },
    // Ahead of the free-text columns: a long comment must never be what
    // pushes the download link off the right edge of the table.
    { label: "Resume" },
    { label: "Proficient In" },
    { label: "Comments" },
  ];
}

function SortHeader({
  label,
  column,
  tab,
  activeSort,
  activeDir,
}: {
  label: string;
  column?: string;
  tab: TabKey;
  activeSort: string;
  activeDir: "ASC" | "DESC";
}) {
  const base =
    "whitespace-nowrap px-3 py-3 font-heading text-[11px] uppercase tracking-[0.12em] text-acorn-charcoal";

  if (!column) {
    return <th className={base}>{label}</th>;
  }

  const isActive = column === activeSort;
  // Clicking the active column flips direction; a new column starts descending.
  const nextDir = isActive && activeDir === "DESC" ? "asc" : "desc";

  return (
    <th
      className={base}
      aria-sort={
        isActive ? (activeDir === "ASC" ? "ascending" : "descending") : "none"
      }
    >
      <Link
        href={`/admin?tab=${tab}&sort=${column}&dir=${nextDir}`}
        className="inline-flex items-center gap-1 hover:text-acorn-rust"
      >
        {label}
        <span
          aria-hidden
          className={isActive ? "text-acorn-rust" : "text-acorn-charcoal/30"}
        >
          {isActive ? (activeDir === "ASC" ? "↑" : "↓") : "↕"}
        </span>
      </Link>
    </th>
  );
}

const CELL = "px-3 py-3 text-acorn-charcoal/80";
const NOWRAP = `${CELL} whitespace-nowrap`;

function Long({ value }: { value: string | null }) {
  return (
    <td className={CELL}>
      {/* A floor as well as a ceiling: without min-w the table's auto layout
          collapses these columns to min-content (one word per line) while the
          nowrap columns take all the slack. */}
      <div className="min-w-[10rem] max-w-[16rem] whitespace-pre-wrap break-words">
        {value || "—"}
      </div>
    </td>
  );
}

function EmailCell({ email }: { email: string }) {
  return (
    <td className={CELL}>
      <a href={`mailto:${email}`} className="text-acorn-rust hover:underline">
        {email}
      </a>
    </td>
  );
}

function ContactCells({ row }: { row: ContactRow }) {
  return (
    <>
      <td className={NOWRAP}>{formatDateTime(row.created_at)}</td>
      <td className={NOWRAP}>{row.name}</td>
      <EmailCell email={row.email} />
      <td className={NOWRAP}>{row.phone || "—"}</td>
      <Long value={row.message} />
    </>
  );
}

function EstimateCells({ row }: { row: EstimateRow }) {
  const address = [row.mailing_address, row.postal_code, row.province, row.country]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <td className={NOWRAP}>{formatDateTime(row.created_at)}</td>
      <td className={NOWRAP}>{row.name}</td>
      <EmailCell email={row.email} />
      <td className={NOWRAP}>{row.phone || "—"}</td>
      <Long value={address || null} />
      <td className={NOWRAP}>{row.city || "—"}</td>
      <td className={NOWRAP}>{row.building_type || "—"}</td>
      <Long value={row.building_location} />
      <td className={NOWRAP}>{row.proposed_start_date || "—"}</td>
      <td className={NOWRAP}>
        {row.building_size_sqft === null
          ? "—"
          : row.building_size_sqft.toLocaleString()}
      </td>
      <Long value={row.description} />
      <Long value={row.comments} />
    </>
  );
}

function CareerCells({ row }: { row: CareerRow }) {
  return (
    <>
      <td className={NOWRAP}>{formatDateTime(row.created_at)}</td>
      <td className={NOWRAP}>{row.name}</td>
      <EmailCell email={row.email} />
      <td className={NOWRAP}>{row.phone}</td>
      <td className={NOWRAP}>{row.years_experience || "—"}</td>
      <td className={NOWRAP}>{row.start_date || "—"}</td>
      <td className={NOWRAP}>{row.expected_wage || "—"}</td>
      <td className={NOWRAP}>
        {row.resume_filename ? (
          <a
            href={`/api/admin/resume/${row.id}`}
            className="text-acorn-rust hover:underline"
            title={row.resume_filename}
          >
            Download Resume
          </a>
        ) : (
          "—"
        )}
      </td>
      <Long value={parseProficiencies(row.proficiencies)} />
      <Long value={row.comments} />
    </>
  );
}
