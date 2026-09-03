# Local development setup

Everything needed to run this site on a development machine. For deploying to
Hostinger, see [DEPLOYMENT.md](DEPLOYMENT.md).

```bash
npm install
cp .env.example .env.local     # then fill in the values below
node scripts/mysql-local.mjs start
npm run dev                    # http://localhost:3000
```

---

## Local MySQL

The site needs MySQL for the admin dashboard, the three forms, and the
client-editable content on the home, projects and services pages. Without it
the public pages still render — they fall back to the copy compiled into
`src/data/` — but `/admin` shows a database error.

### Where it lives

| | |
| --- | --- |
| Home | `C:\Users\adeyinka\acorn-dev\mysql` |
| Server binaries | `<home>\server` (portable MySQL 8.4.6, unzipped — **not** an installed Windows service) |
| Data directory | `<home>\data` |
| Error log | `<home>\mysqld.log` |

The path is read from **`LOCAL_MYSQL_HOME`** in `.env.local`, so it is per
machine and never committed. Point it at whatever folder holds `server/` and
`data/` on yours.

> **Do not put the data directory under a temp path.** It used to live under
> `%LOCALAPPDATA%\Temp\...`, and Windows pruned that folder mid-session while
> the server was running. It took the `.ibd` files for `estimate_requests` and
> `career_applications` with it, and both tables had to be dropped and rebuilt
> from `schema.sql`. `node scripts/mysql-local.mjs status` warns if the data
> directory is ever under a temp path again.

### Start, stop, status

```bash
node scripts/mysql-local.mjs start    # starts detached; safe to re-run
node scripts/mysql-local.mjs stop     # clean shutdown
node scripts/mysql-local.mjs status   # port, version, datadir, row counts
```

`stop` issues a protocol-level `SHUTDOWN`, so InnoDB flushes and closes its
tablespaces before the process exits. Prefer it over killing the process, which
leaves crash recovery to the next start.

`status` output when everything is healthy:

```
  server:  running on port 3306
  home:    C:\Users\adeyinka\acorn-dev\mysql
  version: 8.4.6
  datadir: C:\Users\adeyinka\acorn-dev\mysql\data\
  database acorn_construction: 6 table(s)
     career_applications       1 rows
     contact_submissions       4 rows
     estimate_requests         0 rows
     projects                 16 rows
     service_content           3 rows
     testimonials              3 rows
```

If `start` fails, the reason is at the end of `<home>\mysqld.log`. The usual
causes are a stale `mysqld.exe` still holding the data directory (check Task
Manager) or something else already on port 3306.

### Creating or resetting the database

The six tables come from [`schema.sql`](schema.sql), and the editable content
from [`scripts/seed-content.sql`](scripts/seed-content.sql). Both are safe to
re-run: every table is `CREATE TABLE IF NOT EXISTS`, and the seed only fills
tables that are empty.

`schema.sql` deliberately contains no `CREATE DATABASE`, because on Hostinger
the host creates the database. Locally you have to create it once yourself:

```sql
CREATE DATABASE IF NOT EXISTS acorn_construction
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### A note on the bundled client tools

`server\bin` has `mysql.exe`, `mysqladmin.exe` and `mysqldump.exe`, but the
first two and `mysqldump` hang when run from a non-interactive shell on this
machine — they produce no output and never exit. They may well behave normally
in an ordinary terminal; they were not usable from the automated shell this was
set up in, which is why `scripts/mysql-local.mjs` talks to the server over the
MySQL protocol via `mysql2` instead of shelling out to them.

**Practical consequence:** treat `mysqldump` as unverified here. The reliable
rebuild path is `schema.sql` + `scripts/seed-content.sql`, and the only data
that is not reproducible from those is local test form submissions.

---

## Environment variables

`.env.local` is gitignored. `.env.example` lists every variable with notes;
these are the ones that matter locally.

| Variable | Local value |
| --- | --- |
| `LOCAL_MYSQL_HOME` | folder containing `server/` and `data/` |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` |
| `DB_USER` / `DB_PASSWORD` | `root` and whatever the portable install was initialised with |
| `DB_NAME` | `acorn_construction` |
| `DB_POOL_MAX` | omit locally; defaults to 5 |
| `ADMIN_PASSWORD` | anything, for signing in to `/admin` |
| `ADMIN_SESSION_SECRET` | anything; omitted, the admin password is used |
| `SMTP_*` | **leave blank.** With no `SMTP_HOST`, the mailer creates a throwaway Ethereal inbox on first send and prints a preview URL to the terminal, so form notifications can be read without sending real email |
| `R2_*` | leave blank unless testing uploads. Blank means an upload is refused with a visible error rather than falling back to disk — deliberately, since disk storage is the bug the R2 migration removed |
| `TRUSTED_PROXY_COUNT` | omit; defaults to 1. Locally there is no proxy, so rate limiting keys every request to one shared bucket and logs a one-time warning |

---

## Commands

| | |
| --- | --- |
| `npm run dev` | dev server with Turbopack, http://localhost:3000 |
| `npm run build` | production build; also type-checks |
| `npm run start` | serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | type-check only, faster than a full build |

There is no test runner in this project.

### Next.js version

`next` is pinned to an exact `16.2.12`, with no `^`. **Do not run
`npm audit fix --force`** — it bumps Next to a version whose prebuilt SWC
binary needs a newer GLIBC than Hostinger's build image has, which breaks every
deploy silently. See the pin section in [DEPLOYMENT.md](DEPLOYMENT.md) for the
exact error and the options for fixing it properly. Plain `npm audit fix`
without `--force` is safe.
