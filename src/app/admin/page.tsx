import Link from "next/link";
import { isAdminConfigured, isAuthenticated } from "@/lib/admin-auth";
import { execute, query } from "@/lib/db";
import {
  LIST_COLUMNS,
  TABLE_NAMES,
  TABS,
  READ_FILTERS,
  CONTENT_TABS,
  isContentTab,
  formatValue,
  readFilterClause,
  listSelectColumns,
  detailSelectColumns,
  toDir,
  toReadFilter,
  toSort,
  toTab,
  type ColumnDef,
  type SubmissionRow,
  type TabKey,
} from "@/lib/admin-data";
import { dashboardStats, type DashboardStats } from "@/lib/admin-stats";
import AdminBar from "./AdminBar";
import StatsOverview from "./StatsOverview";
import LoginForm from "./LoginForm";
import RowShell from "./RowShell";
import DeleteButton from "./DeleteButton";
import ResumeLink from "./ResumeLink";
import SubmissionDetail from "./SubmissionDetail";
import SubmissionCards from "./SubmissionCards";
import ProjectsPanel from "./content/ProjectsPanel";
import TestimonialsPanel from "./content/TestimonialsPanel";
import ServicesPanel from "./content/ServicesPanel";

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
    error?: string;
  }>;
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

  // ---- Content tabs -------------------------------------------------------
  // Editable site content rather than an inbox: no read/unread, sorting or
  // filtering, so this takes its own branch instead of contorting the
  // submission view.
  if (isContentTab(params.tab)) {
    const contentTab = params.tab;

    let contentStats: DashboardStats | null = null;
    let contentError: string | null = null;
    try {
      contentStats = await dashboardStats();
    } catch (error) {
      console.error("[admin] Stats query failed:", error);
      contentError =
        "Could not read the database. Check that MySQL is running and that schema.sql has been applied.";
    }

    const contentUnread: Record<TabKey, number> = {
      contact: contentStats?.contact.unread ?? 0,
      estimate: contentStats?.estimate.unread ?? 0,
      careers: contentStats?.careers.unread ?? 0,
    };

    return (
      <>
        <AdminBar authed unread={contentStats ? contentStats.totalUnread : null} />

        <div className="px-4 py-10 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <header className="border-b border-acorn-bronze/20 pb-6">
              <h1 className="font-heading text-3xl uppercase tracking-wide text-acorn-charcoal">
                Site Content
              </h1>
              <p className="mt-1 text-sm text-acorn-charcoal/70">
                Changes here go live on the website straight away.
              </p>
            </header>

            <TabNav activeTab={contentTab} unread={contentUnread} />

            {params.error && (
              <p
                role="alert"
                className="mt-6 rounded-sm border border-acorn-rust/40 bg-acorn-rust/5 px-4 py-3 text-sm text-acorn-rust"
              >
                {params.error}
              </p>
            )}

            {contentError ? (
              <p className="mt-8 rounded-sm border border-acorn-rust/40 bg-white p-6 text-sm text-acorn-rust">
                {contentError}
              </p>
            ) : contentTab === "projects" ? (
              <ProjectsPanel />
            ) : contentTab === "testimonials" ? (
              <TestimonialsPanel />
            ) : (
              <ServicesPanel />
            )}
          </div>
        </div>
      </>
    );
  }

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
  let stats: DashboardStats | null = null;
  let detailRow: SubmissionRow | null = null;
  let dbError: string | null = null;

  try {
    stats = await dashboardStats();

    if (wantsDetail) {
      const found = await query<SubmissionRow>(
        `SELECT ${detailSelectColumns(tab)} FROM ${TABLE_NAMES[tab]} WHERE id = ?`,
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
          `SELECT ${detailSelectColumns(tab)} FROM ${TABLE_NAMES[tab]} WHERE id = ?`,
          [detailId]
        );
        detailRow = refreshed[0] ?? detailRow;
        stats = await dashboardStats();
      }
    }

    rows = await query<SubmissionRow>(
      `SELECT ${listSelectColumns(tab)} FROM ${TABLE_NAMES[tab]}
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

  const unread: Record<TabKey, number> = {
    contact: stats?.contact.unread ?? 0,
    estimate: stats?.estimate.unread ?? 0,
    careers: stats?.careers.unread ?? 0,
  };

  return (
    <>
      <AdminBar authed unread={stats ? stats.totalUnread : null} />

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

        {stats && <StatsOverview stats={stats} />}

        <TabNav activeTab={tab} unread={unread} />

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
            {/* Below md the table becomes a stacked card list: nine columns
                cannot be read on a phone without scrolling sideways. */}
            <div className="md:hidden">
              <SubmissionCards
                tab={tab}
                rows={rows}
                listParams={listParams}
                hrefFor={(row) =>
                  `/admin?${new URLSearchParams({
                    tab,
                    ...listParams,
                    id: String(row.id),
                  })}`
                }
              />
            </div>

            <div className="mt-3 hidden overflow-x-auto rounded-sm border border-acorn-bronze/20 bg-white md:block">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-acorn-stone">
                  <tr>
                    {/* relative: sr-only is position:absolute, and without a
                        positioned ancestor it resolves against the initial
                        containing block — escaping this table's horizontal
                        scroll container and making the whole page scroll
                        sideways. Anchoring it to the cell keeps it contained. */}
                    <th className="relative w-8 px-3 py-3">
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
                    <th className="relative px-3 py-3">
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
            ? // line-clamp-2 caps the cell at two lines and adds its own
              // ellipsis; min-h reserves both lines even for a short message, so
              // every row in the table is the same height whether the message is
              // ten characters or ten thousand. 2.5rem is two lines of text-sm.
              // The full text lives in the detail view.
              "min-w-[10rem] max-w-[16rem] min-h-[2.5rem] whitespace-pre-wrap break-words line-clamp-2"
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

/**
 * One tab bar for both groups. The submission tabs carry unread badges; the
 * content tabs are separated by a divider so it reads as two kinds of thing
 * rather than six equivalent inboxes.
 */
function TabNav({
  activeTab,
  unread,
}: {
  activeTab: string;
  unread: Record<TabKey, number>;
}) {
  // min-h-11 is 44px, the minimum comfortable tap target.
  const base =
    "inline-flex min-h-11 items-center gap-2 rounded-sm px-4 py-2 font-heading text-xs uppercase tracking-[0.15em] transition-colors";
  const inactive =
    "border border-acorn-bronze/30 text-acorn-charcoal hover:bg-acorn-stone";
  const active = "bg-acorn-charcoal text-acorn-cream";

  return (
    <nav
      aria-label="Dashboard sections"
      className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
    >
      <div className="flex flex-wrap items-center gap-2">
      {TABS.map((candidate) => {
        const isActive = candidate.key === activeTab;
        const count = unread[candidate.key];
        return (
          <Link
            key={candidate.key}
            href={`/admin?tab=${candidate.key}`}
            className={`${base} ${isActive ? active : inactive}`}
          >
            {/* Short label on the narrowest screens, so six 44px tabs still
                wrap into a couple of rows rather than a tall stack. */}
            <span className="sm:hidden">{candidate.shortLabel}</span>
            <span className="hidden sm:inline">{candidate.label}</span>
            {count > 0 && (
              <span
                aria-label={`${count} unread`}
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  isActive
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

      </div>

      {/* Only meaningful when the two groups sit on one line; when they stack
          on mobile the line break is the separation. */}
      <span
        aria-hidden="true"
        className="mx-1 hidden h-6 w-px bg-acorn-bronze/30 sm:block"
      />

      <div className="flex flex-wrap items-center gap-2">
      {CONTENT_TABS.map((candidate) => {
        const isActive = candidate.key === activeTab;
        return (
          <Link
            key={candidate.key}
            href={`/admin?tab=${candidate.key}`}
            className={`${base} ${isActive ? active : inactive}`}
          >
            {candidate.label}
          </Link>
        );
      })}
      </div>
    </nav>
  );
}
