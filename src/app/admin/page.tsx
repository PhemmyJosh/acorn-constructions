import Link from "next/link";
import { isAdminConfigured, isAuthenticated } from "@/lib/admin-auth";
import { execute, query } from "@/lib/db";
import {
  LIST_COLUMNS,
  TABLE_NAMES,
  TABS,
  READ_FILTERS,
  formatValue,
  readFilterClause,
  selectColumns,
  toDir,
  toReadFilter,
  toSort,
  toTab,
  type ColumnDef,
  type SubmissionRow,
  type TabKey,
} from "@/lib/admin-data";
import AdminBar from "./AdminBar";
import LoginForm from "./LoginForm";
import RowShell from "./RowShell";
import DeleteButton from "./DeleteButton";
import ResumeLink from "./ResumeLink";
import SubmissionDetail from "./SubmissionDetail";

// Live database rows on every request; the layout also opts this route into
// dynamic rendering by reading the session cookie.
export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: Promise<{
    tab?: string;
    sort?: string;
    dir?: string;
    read?: string;
    id?: string;
  }>;
}

/** Per-tab unread counts, in one round trip rather than three. */
async function unreadCounts(): Promise<Record<TabKey, number>> {
  const rows = await query<{ contact: number; estimate: number; careers: number }>(
    `SELECT
       (SELECT COUNT(*) FROM ${TABLE_NAMES.contact}  WHERE is_read = 0) AS contact,
       (SELECT COUNT(*) FROM ${TABLE_NAMES.estimate} WHERE is_read = 0) AS estimate,
       (SELECT COUNT(*) FROM ${TABLE_NAMES.careers}  WHERE is_read = 0) AS careers`
  );
  const row = rows[0];
  return {
    contact: Number(row?.contact ?? 0),
    estimate: Number(row?.estimate ?? 0),
    careers: Number(row?.careers ?? 0),
  };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  if (!(await isAuthenticated())) {
    // Preserve an emailed deep link across the sign-in step.
    const requested = await searchParams;
    const wanted = new URLSearchParams();
    for (const key of ["tab", "id", "read", "sort", "dir"] as const) {
      const value = requested[key];
      if (typeof value === "string" && value) wanted.set(key, value);
    }
    const next = wanted.size > 0 ? `/admin?${wanted.toString()}` : "/admin";

    return (
      <>
        <AdminBar authed={false} unread={null} />
        <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm rounded-sm border border-acorn-bronze/20 bg-white p-8 shadow-sm">
          <h1 className="font-heading text-2xl uppercase tracking-wide text-acorn-charcoal">
            Admin Sign In
          </h1>
          <p className="mt-2 mb-6 text-sm text-acorn-charcoal/70">
            Form submissions for Acorn Construction.
          </p>
            <LoginForm configured={isAdminConfigured()} next={next} />
          </div>
        </div>
      </>
    );
  }

  const params = await searchParams;
  const tab = toTab(params.tab);
  const sort = toSort(tab, params.sort);
  const dir = toDir(params.dir);
  const readFilter = toReadFilter(params.read);

  // Carried through every link and action so filter/sort survive navigation.
  const listParams: Record<string, string> = {};
  if (readFilter !== "all") listParams.read = readFilter;
  if (params.sort && sort !== "created_at") listParams.sort = sort;
  if (params.dir === "asc") listParams.dir = "asc";

  const detailId = Number(params.id);
  const wantsDetail = Number.isInteger(detailId) && detailId > 0;

  let rows: SubmissionRow[] = [];
  let unread: Record<TabKey, number> = { contact: 0, estimate: 0, careers: 0 };
  let detailRow: SubmissionRow | null = null;
  let dbError: string | null = null;

  try {
    unread = await unreadCounts();

    if (wantsDetail) {
      const found = await query<SubmissionRow>(
        `SELECT ${selectColumns(tab)} FROM ${TABLE_NAMES[tab]} WHERE id = ?`,
        [detailId]
      );
      detailRow = found[0] ?? null;

      // Opening the detail view marks it read. Guarded on is_read = 0 so a
      // re-render or a refresh cannot overwrite the original read_at, and the
      // row links use prefetch={false} so hovering never triggers this.
      if (detailRow && !detailRow.is_read) {
        await execute(
          `UPDATE ${TABLE_NAMES[tab]}
              SET is_read = 1, read_at = NOW()
            WHERE id = ? AND is_read = 0`,
          [detailId]
        );
        console.log(`[admin] Marked ${TABLE_NAMES[tab]} row ${detailId} read`);

        // Re-select rather than patching the object in memory, so the detail
        // view shows the real read_at that MySQL just wrote instead of the
        // NULL it was fetched with.
        const refreshed = await query<SubmissionRow>(
          `SELECT ${selectColumns(tab)} FROM ${TABLE_NAMES[tab]} WHERE id = ?`,
          [detailId]
        );
        detailRow = refreshed[0] ?? detailRow;
        unread = await unreadCounts();
      }
    }

    rows = await query<SubmissionRow>(
      `SELECT ${selectColumns(tab)} FROM ${TABLE_NAMES[tab]}
        ${readFilterClause(readFilter)}
        ORDER BY ${sort} ${dir}, id ${dir}
        LIMIT 500`
    );
  } catch (error) {
    console.error("[admin] Query failed:", error);
    dbError =
      "Could not read the database. Check that MySQL is running, that the DB_* values in .env.local are correct, and that schema.sql has been applied.";
  }

  const closeHref = `/admin?${new URLSearchParams({ tab, ...listParams })}`;
  const columns = LIST_COLUMNS[tab];

  const totalUnread = dbError
    ? null
    : unread.contact + unread.estimate + unread.careers;

  return (
    <>
      <AdminBar authed unread={totalUnread} />

      <div className="px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
        <header className="border-b border-acorn-bronze/20 pb-6">
          <h1 className="font-heading text-3xl uppercase tracking-wide text-acorn-charcoal">
            Form Submissions
          </h1>
          <p className="mt-1 text-sm text-acorn-charcoal/70">
            Newest first by default. Click any row to read it in full.
          </p>
        </header>

        <nav aria-label="Submission types" className="mt-6 flex flex-wrap gap-2">
          {TABS.map((candidate) => {
            const active = candidate.key === tab;
            const count = unread[candidate.key];
            return (
              <Link
                key={candidate.key}
                href={`/admin?tab=${candidate.key}`}
                className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 font-heading text-xs uppercase tracking-[0.15em] transition-colors ${
                  active
                    ? "bg-acorn-charcoal text-acorn-cream"
                    : "border border-acorn-bronze/30 text-acorn-charcoal hover:bg-acorn-stone"
                }`}
              >
                {candidate.label}
                {count > 0 && (
                  <span
                    aria-label={`${count} unread`}
                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                      active
                        ? "bg-acorn-gold text-acorn-charcoal"
                        : "bg-acorn-rust text-white"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-heading text-[11px] uppercase tracking-[0.15em] text-acorn-charcoal/60">
            Show
          </span>
          {READ_FILTERS.map((filter) => {
            const active = filter.key === readFilter;
            const next = new URLSearchParams({ tab, ...listParams });
            if (filter.key === "all") next.delete("read");
            else next.set("read", filter.key);
            return (
              <Link
                key={filter.key}
                href={`/admin?${next.toString()}`}
                aria-current={active ? "true" : undefined}
                className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-acorn-bronze text-acorn-cream"
                    : "border border-acorn-bronze/30 text-acorn-charcoal hover:bg-acorn-stone"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {dbError ? (
          <p className="mt-8 rounded-sm border border-acorn-rust/40 bg-white p-6 text-sm text-acorn-rust">
            {dbError}
          </p>
        ) : rows.length === 0 ? (
          <p className="mt-8 rounded-sm border border-acorn-bronze/20 bg-white p-6 text-sm text-acorn-charcoal/70">
            {readFilter === "all"
              ? "No submissions yet."
              : `No ${readFilter} submissions in this tab.`}
          </p>
        ) : (
          <>
            <p className="mt-6 text-xs uppercase tracking-[0.15em] text-acorn-charcoal/60">
              {rows.length} {rows.length === 1 ? "entry" : "entries"}
              {readFilter !== "all" && ` · ${readFilter}`}
            </p>
            <div className="mt-3 overflow-x-auto rounded-sm border border-acorn-bronze/20 bg-white">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-acorn-stone">
                  <tr>
                    <th className="w-8 px-3 py-3">
                      <span className="sr-only">Unread</span>
                    </th>
                    {columns.map((column) => (
                      <SortHeader
                        key={column.key}
                        column={column}
                        tab={tab}
                        activeSort={sort}
                        activeDir={dir}
                        listParams={listParams}
                      />
                    ))}
                    <th className="px-3 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isUnread = !row.is_read;
                    const href = `/admin?${new URLSearchParams({
                      tab,
                      ...listParams,
                      id: String(row.id),
                    })}`;

                    return (
                      <RowShell key={row.id} href={href} isUnread={isUnread}>
                        <td className="px-3 py-3 align-top">
                          {isUnread && (
                            <span
                              title="Unread"
                              aria-label="Unread"
                              className="mt-1.5 block h-2 w-2 rounded-full bg-acorn-rust"
                            />
                          )}
                        </td>

                        {columns.map((column, index) => (
                          <Cell
                            key={column.key}
                            column={column}
                            row={row}
                            isUnread={isUnread}
                            // The first cell carries the real link, so the row
                            // is reachable and announced without a mouse.
                            href={index === 0 ? href : undefined}
                          />
                        ))}

                        <td className="px-3 py-3 align-top">
                          <DeleteButton
                            tab={tab}
                            id={row.id}
                            name={String(row.name)}
                            hasResume={Boolean(row.resume_filename)}
                            listParams={listParams}
                          />
                        </td>
                      </RowShell>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        </div>
      </div>

      {wantsDetail && detailRow && (
        <SubmissionDetail
          tab={tab}
          row={detailRow}
          closeHref={closeHref}
          listParams={listParams}
        />
      )}
    </>
  );
}

function SortHeader({
  column,
  tab,
  activeSort,
  activeDir,
  listParams,
}: {
  column: ColumnDef;
  tab: TabKey;
  activeSort: string;
  activeDir: "ASC" | "DESC";
  listParams: Record<string, string>;
}) {
  const base =
    "whitespace-nowrap px-3 py-3 font-heading text-[11px] uppercase tracking-[0.12em] text-acorn-charcoal";

  if (!column.sortable) {
    return <th className={base}>{column.label}</th>;
  }

  const isActive = column.key === activeSort;
  // Clicking the active column flips direction; a new column starts descending.
  const nextDir = isActive && activeDir === "DESC" ? "asc" : "desc";
  const href = `/admin?${new URLSearchParams({
    ...listParams,
    tab,
    sort: column.key,
    dir: nextDir,
  })}`;

  return (
    <th
      className={base}
      aria-sort={
        isActive ? (activeDir === "ASC" ? "ascending" : "descending") : "none"
      }
    >
      <Link
        href={href}
        className="inline-flex items-center gap-1 hover:text-acorn-rust"
      >
        {column.label}
        <span
          aria-hidden="true"
          className={isActive ? "text-acorn-rust" : "text-acorn-charcoal/30"}
        >
          {isActive ? (activeDir === "ASC" ? "↑" : "↓") : "↕"}
        </span>
      </Link>
    </th>
  );
}

function Cell({
  column,
  row,
  isUnread,
  href,
}: {
  column: ColumnDef;
  row: SubmissionRow;
  isUnread: boolean;
  href?: string;
}) {
  // Unread rows read heavier; read rows sit back.
  const tone = isUnread
    ? "font-semibold text-acorn-charcoal"
    : "text-acorn-charcoal/70";
  const padding = "px-3 py-3 align-top";

  if (column.format === "resume") {
    return (
      <td className={`${padding} whitespace-nowrap ${tone}`}>
        {row.resume_filename ? (
          <ResumeLink id={row.id} filename={String(row.resume_filename)} />
        ) : (
          "—"
        )}
      </td>
    );
  }

  const content = formatValue(row[column.key], column.format);

  return (
    <td className={`${padding} ${tone}`}>
      <div
        className={
          column.wrap
            ? "min-w-[10rem] max-w-[16rem] whitespace-pre-wrap break-words"
            : "whitespace-nowrap"
        }
      >
        {href ? (
          // prefetch={false}: prefetching this URL would run the page's
          // mark-as-read update on hover, before the row is actually opened.
          <Link href={href} prefetch={false} className="hover:underline">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </td>
  );
}
