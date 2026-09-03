# Deployment checklist

Deploying and operating this site on Hostinger. For running it on a development
machine, see [LOCAL-DEV.md](LOCAL-DEV.md).

The site **requires Node hosting**, not static hosting: `/admin` and the three
`/api/*` routes are server-rendered on demand, and `next/image` uses the default
optimizing loader. A static export is not an option without removing those.

---

## Read this first: a deploy that fails is silent

**If a change is pushed and does not appear on the live site, check the build
log before suspecting caching, the CDN, or the code.**

A failed build on Hostinger does not take the site down and does not show an
error to visitors. The previous successful build keeps serving, so the site
looks completely healthy while every new commit quietly never ships.

This has already cost this project real time once. A `npm audit fix --force`
bumped Next.js to a version whose prebuilt binary the build image cannot load
(see [the version pin](#do-not-upgrade-nextjs-past-16212-yet)); four commits'
worth of work sat unpublished, and the symptom was simply "the new feature
isn't there". Nothing in the browser could have revealed it.

So, in order:

1. **hPanel → your Node app → Deployments / Build log.** Read the end of the
   most recent build.
2. Confirm the commit it built is the one you expected — a deploy can also
   simply not have been triggered.
3. Only then look at caching or the code.

---

## Current state at a glance

| | |
| --- | --- |
| Hosting | Hostinger Node.js hosting, account registered to **mark@acornconstruction.ca** |
| Repository | `github.com/PhemmyJosh/acorn-constructions`, branch `master`. **Transfer to a business-owned organisation is still pending** — see the TODO in § 2 |
| Database | MySQL on Hostinger; schema from `schema.sql`, content from `scripts/seed-content.sql` |
| Photo storage | Cloudflare R2. Nothing is written to the server's disk |
| Email | **Not configured yet.** Form notifications currently go nowhere real — see § 4 |
| Next.js | pinned to exactly `16.2.12`; newer breaks the build |
| Security headers | **None configured** — see [Security headers](#security-headers--not-yet-configured) |

---

## 1. The hosting plan

Already purchased, under **mark@acornconstruction.ca**. Recorded here for
whoever renews or migrates it.

What the app needs from the plan:

- Node.js application hosting, **Node 20 or newer** (Next.js 16 requires it)
- At least one MySQL database
- At least one email mailbox on the domain (see § 4 — not yet set up)
- Free SSL / Let's Encrypt

The cheapest shared/static tiers will not run this app. The Business plan is the
usual fit.

---

## 2. The Node.js web app and the GitHub connection

In hPanel, **Websites → your site → Node.js app** (or *Advanced → Node.js* on
some plan layouts):

| Setting | Value |
| --- | --- |
| Node version | 20 or newer |
| Repository | `github.com/PhemmyJosh/acorn-constructions`, branch `master` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Start command | `npm run start` |
| Port | from `process.env.PORT` — `next start` already honours it, no code change needed |

`npm ci` rather than `npm install` on purpose: it installs exactly what
`package-lock.json` pins, which is what makes
[the Next.js version pin](#do-not-upgrade-nextjs-past-16212-yet) actually
binding on the build server.

> **TODO — repository ownership.** The repo is still under the personal
> `PhemmyJosh` account. Moving it to a business-owned GitHub organisation is
> outstanding. When that happens, three things need updating together, or
> deploys stop:
>
> 1. GitHub: transfer the repository to the organisation.
> 2. hPanel: reconnect the Node app to the new repository URL and
>    re-authorise Hostinger's GitHub app against the organisation.
> 3. This file and any other reference to the old URL.
>
> A transfer leaves a redirect from the old URL, so a stale integration can
> keep appearing to work for a while and then stop — do step 2 deliberately
> rather than assuming it carried over.

If the environment variables in § 5 are not set before the first deploy, the
first boot fails against a missing database.

---

## 3. Create the MySQL database and load the schema

1. **hPanel → Databases → MySQL Databases → Create new database.**
2. Note the generated values — on shared hosting the database and user names are
   prefixed, e.g. `u123456789_acorn`:
   - database name
   - username
   - password
   - host (usually `localhost`, sometimes a dedicated hostname)
3. Record the **max concurrent connections** shown for the plan; it is needed
   for `DB_POOL_MAX` in step 5.
4. Load the schema. Either use **phpMyAdmin → Import** and upload
   [`schema.sql`](schema.sql), or over SSH:

   ```bash
   mysql -h localhost -u u123456789_acorn -p u123456789_acorn < schema.sql
   ```

   `schema.sql` intentionally contains no `CREATE DATABASE` or `USE` statement,
   because the host creates the database for you and only grants rights on it.
   The target database is named on the command line instead. Every statement is
   `CREATE TABLE IF NOT EXISTS`, so re-running the file is safe.

5. Verify three tables exist:

   ```bash
   mysql -h localhost -u u123456789_acorn -p u123456789_acorn -e "SHOW TABLES;"
   ```

   Expected: `career_applications`, `contact_submissions`, `estimate_requests`,
   `projects`, `service_content`, `testimonials`.

6. **Seed the editable content** so the site ships with the copy and gallery it
   has today, rather than an empty Content tab. Two routes to the same result:

   - **phpMyAdmin → SQL tab**, paste
     [`scripts/seed-content.sql`](scripts/seed-content.sql). This is the one to
     use on shared hosting, since it needs nothing but a database connection.
   - **Over SSH with Node available**, `node scripts/seed-content.mjs`, which
     reads the same content out of `src/data/` and inserts it.

   Both are safe to re-run: they only fill tables that are empty and never
   overwrite anything edited through the admin. Until one runs, the public site
   falls back to the copy compiled into `src/data/`, so nothing breaks either
   way — the Content tab in `/admin` is simply empty.

### Why `DB_POOL_MAX` is deliberately small

The pool defaults to **5** connections and is capped by `DB_POOL_MAX`. Shared
hosting caps concurrent connections per database, and exhausting that cap does
not slow the site down — it makes every query fail, including the ones behind
`/admin`, until connections are released. Five is comfortably under any
Hostinger tier's limit for a site with this traffic. Raise it only after
checking the plan's actual limit in step 3, and leave headroom: phpMyAdmin and
any cron job draw from the same allowance.

---

## 4. Email — NOT CONFIGURED YET

**This is outstanding and the site should not be considered launched without
it.** No SMTP credentials are set in Hostinger, and the consequence is specific:

`src/lib/mailer.ts` falls back to a **throwaway Ethereal test inbox** when
`SMTP_HOST` is unset. Ethereal accepts the message, never delivers it, and
prints a preview URL to the server log. So right now:

- Contact, estimate and career submissions **are** saved to the database and
  **are** visible in `/admin`.
- The notification email announcing them **goes nowhere Mark can read.**

Nothing appears broken from the outside, which is exactly why it is called out
here rather than buried in a checklist.

### To fix it

1. **hPanel → Emails → Email Accounts → Create email account** on the domain,
   e.g. `mark@acornconstruction.ca` — the address already used throughout
   `src/data/company.ts`.
2. From the mailbox's **Configuration / Connect devices** panel, take the
   outgoing SMTP settings. For Hostinger's Titan mail these are typically host
   `smtp.hostinger.com`, port `465` with SSL/TLS, username the full email
   address, password the mailbox password.
3. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and
   `NOTIFY_EMAIL` per § 5, then redeploy.
4. Submit the contact form on the live site and confirm the email actually
   arrives. **Check the server log for the phrase `SMTP_HOST is not set` —
   if it is still there, the variables did not take effect.**

Optionally create a second mailbox (e.g. `noreply@`) to send from, keeping
`mark@` as the destination: then `SMTP_USER` is the noreply address and
`NOTIFY_EMAIL` stays `mark@`.

TLS is selected automatically — port `465` connects secure, anything else
starts plain and upgrades.

---

## 5. Set production environment variables

**hPanel → your Node app → Environment variables.** This is the complete list
the app reads; nothing else is consulted in production.

Leaving `SMTP_HOST` blank routes every notification to a throwaway Ethereal
test inbox instead of real email, silently — which is the situation today (§ 4).

| Variable | Value |
| --- | --- |
| `R2_ACCOUNT_ID` | Cloudflare R2 — hex string in the API endpoint host |
| `R2_ACCESS_KEY_ID` | from the R2 API token |
| `R2_SECRET_ACCESS_KEY` | from the R2 API token, shown only once |
| `R2_BUCKET_NAME` | the bucket holding project photos |
| `R2_PUBLIC_URL` | the bucket's public URL, e.g. `https://pub-xxxx.r2.dev`. **Also needed at build time** — next.config.ts reads it to allow the hostname through next/image |
| `APP_URL` | the live site's base URL, e.g. `https://acornconstruction.ca` — notification emails build their "View in Dashboard" link from this, so leaving it unset makes those links point at localhost |
| `TRUSTED_PROXY_COUNT` | number of proxies in front of the app. **Defaults to 1, which is correct for a standard Hostinger Node app — usually leave it unset.** Only raise it if you add another hop (e.g. Cloudflare in front of Hostinger). See the rate-limiting note below before changing it |
| `DB_HOST` | from step 3 (usually `localhost`) |
| `DB_PORT` | `3306` unless Hostinger states otherwise |
| `DB_USER` | prefixed username from step 3 |
| `DB_PASSWORD` | database password from step 3 |
| `DB_NAME` | prefixed database name from step 3 |
| `DB_POOL_MAX` | **check the connection limit from step 3 first.** Defaults to 5 if unset. Keep it comfortably below the plan's cap |
| `SMTP_HOST` | from step 4, e.g. `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | sending mailbox address |
| `SMTP_PASSWORD` | mailbox password |
| `NOTIFY_EMAIL` | where submissions are delivered, e.g. `mark@acornconstruction.ca` |
| `ADMIN_PASSWORD` | **generate fresh here.** Never copy the local `.env.local` value |
| `ADMIN_SESSION_SECRET` | **generate fresh here.** Never copy the local value |

One variable exists that must **not** be set here: **`LOCAL_MYSQL_HOME`** is
purely for the portable MySQL used in development (see
[LOCAL-DEV.md](LOCAL-DEV.md)). Production MySQL is managed by Hostinger and the
variable is ignored, so setting it only creates the impression that the app
manages its own database server.

Generate the two admin secrets at deploy time and store them only in a password
manager:

```bash
# passphrase for ADMIN_PASSWORD
node -e "const c=require('crypto');const w=['anvil','birch','cedar','copper','girder','granite','lintel','marble','mortise','purlin','rafter','shingle','slate','spruce','timber','trestle','truss','walnut'];const p=[...w];const o=[];for(let i=0;i<6;i++)o.push(p.splice(c.randomInt(p.length),1)[0]);console.log(o.join('-')+'-'+c.randomInt(1000,10000))"

# 48 random bytes for ADMIN_SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Why fresh: a local development secret has sat on a dev machine, in shell
history and in editor state, so it should be treated as already compromised.
Rotating `ADMIN_PASSWORD` also invalidates every existing admin session by
design, because the session cookie is an HMAC derived from it.

---

## 6. Confirm the production domain — done, verify only

This was a pre-launch blocker and is now set. The domain lives in **one**
place, `siteUrl` in [`src/data/company.ts`](src/data/company.ts), currently
`https://acornconstruction.ca`. Three things read it and must agree:

| Reads `company.siteUrl` | Why it matters |
| --- | --- |
| `metadataBase` in [`src/app/layout.tsx`](src/app/layout.tsx) | relative Open Graph / Twitter image paths resolve against it; unset, they resolve against `http://localhost:3000` and every shared link has a broken preview image |
| `<loc>` URLs in [`src/app/sitemap.ts`](src/app/sitemap.ts) | sitemap entries must be absolute — `metadataBase` does **not** apply to them |
| the `Sitemap:` line in [`src/app/robots.ts`](src/app/robots.ts) | a crawler distrusts a sitemap served from a different origin than the URLs it lists |

**If the domain ever changes, edit `siteUrl` only** — do not hardcode a domain
in those three files. After changing it, redeploy and re-check
`/robots.txt` and `/sitemap.xml`.

Note this is separate from the `APP_URL` environment variable (§ [5. Set production environment variables](#5-set-production-environment-variables)),
which is a runtime value used for dashboard links in notification emails.
`siteUrl` is baked in at build time because the sitemap is generated statically.

While you are there, consider replacing the remaining `PLACEHOLDER` markers.
Search the repo for `PLACEHOLDER` and `NEEDED FROM CLIENT`:

- [ ] team headshots in `src/data/team.ts` are still `placehold.co` images
- [ ] confirm the street address and phone in `src/data/company.ts` are current

---

## 7. Point the domain's DNS at Hostinger

1. **hPanel → Domains**, add the domain to the account.
2. At the current registrar, set the nameservers to Hostinger's
   (`ns1.dns-parking.com` / `ns2.dns-parking.com`), or if you keep DNS
   elsewhere, point the `A` record at the app's IP and add the `www` `CNAME`.
3. Wait for propagation, then issue the **free SSL certificate** in
   hPanel → SSL and enable **force HTTPS**.

HTTPS matters functionally here, not just cosmetically: the admin session cookie
is set with `secure: true` whenever `NODE_ENV === "production"`, so **admin
login will not work over plain HTTP in production**.

---

## 8. Full production smoke test

Do all of this against the live domain, not localhost.

- [ ] **Contact form** — submit a real message. Confirm the success panel
      appears, a row lands in `contact_submissions`, and the notification email
      arrives at `NOTIFY_EMAIL` with a working reply-to.
- [ ] **Estimate form** — submit with every field filled, including a
      **proposed start date** and a building size with a comma (e.g. `6,000`).
      Confirm `proposed_start_date` is a real date and `building_size_sqft` is
      `6000`, not NULL.
- [ ] **Careers form** — submit with a real PDF résumé. Confirm the row, the
      `proficiencies` JSON, and that `resume_data` byte length matches the file.
- [ ] **Oversize résumé** — try a file over 2.4MB and confirm it is rejected
      with a readable message rather than a server error.
- [ ] **Honeypot** — confirm a normal submission still works (the decoy field
      must not be autofilled by the browser). To test the trap itself, use the
      browser console on the live site:
      `document.querySelector('[name=website]').value = 'bot'` before
      submitting; the UI should report success but **no row should appear**.
- [ ] **Dashboard link in email** — open the notification email and click
      *View in Dashboard*. Confirm it goes to the live domain (not localhost)
      and lands on the right entry's detail view after signing in.
- [ ] **/admin login** — sign in with the production `ADMIN_PASSWORD` over
      HTTPS. Confirm a wrong password is rejected.
- [ ] **/admin data** — confirm all three tabs list the rows just created, and
      that sorting by each sortable column reorders correctly.
- [ ] **Résumé download** — click *Download Resume* and confirm the file opens
      and matches what was uploaded.
- [ ] **Sign out** — confirm it returns to the login screen and that `/admin` is
      not reachable afterwards.
- [ ] **Unauthenticated access** — in a private window, confirm `/admin` shows
      the login form and `/api/admin/resume/1` returns 401.
- [ ] **Mobile** — walk one form end to end on a real phone at ~375px wide.
- [ ] **Content editing** — in the admin's Projects tab, add a project with a
      real photo and confirm it appears on /projects; edit a testimonial and a
      service's copy and confirm both pages update on refresh.
- [ ] **Photo persists across a redeploy** — this is the check the R2 migration
      exists to pass, so do not skip it. Take the project added above and
      confirm its `projects.image_filename` is a full `https://` R2 URL, not a
      bare filename. Then trigger a redeploy and confirm the photo **still**
      displays on `/projects` afterwards. Nothing is written to the server's
      disk any more, so `public/uploads/projects/` staying empty is expected
      rather than a failure — see
      [Uploaded project photos](#uploaded-project-photos).
- [ ] **Social preview** — paste the homepage URL into a link-preview debugger
      and confirm the image resolves (this fails if step 6 was skipped).
- [ ] **robots.txt** — open `/robots.txt` and confirm it disallows `/admin` and
      ends with a `Sitemap:` line pointing at the live domain.
- [ ] **sitemap.xml** — open `/sitemap.xml` and confirm it parses as XML and
      lists all eleven public pages on the live domain, with **no** `/admin` or
      `/api/` entry.
- [ ] **noindex on /admin** — view source on `/admin` and confirm
      `<meta name="robots" content="noindex, nofollow"/>` is in the `<head>`.

---

## 9. Remove or restrict remaining dev artifacts

- [ ] Delete the test rows created during the smoke test:

      ```sql
      DELETE FROM contact_submissions WHERE email LIKE '%example.%';
      DELETE FROM estimate_requests   WHERE email LIKE '%example.%';
      DELETE FROM career_applications WHERE email LIKE '%example.%';
      ```

- [ ] Confirm `.env.local` was never committed: `git log --all -- .env.local`
      should return nothing. Only `.env.example` belongs in the repo.
- [ ] Confirm no harness files shipped: `public/` should contain no `.html`
      files, and `src/app/api/` should contain only `admin`, `careers`,
      `contact` and `estimate`.
- [ ] Confirm `/admin` is excluded from search engines — the route already sets
      `robots: { index: false, follow: false }`. Verify the response headers on
      the live site.
- [ ] Consider adding `/admin` to a `robots.txt` disallow as belt and braces.
- [ ] Run `npm audit` and review. Note that the current advisories are in
      dependencies bundled inside Next.js itself; `npm audit fix --force` would
      try to downgrade Next and must not be run.

---

## Uploaded project photos

Project photos go to a **Cloudflare R2 bucket**, not the server's disk, and
`projects.image_filename` stores the object's full public URL.

This is not a preference — local disk was tried and failed twice over:

- Hostinger builds each deploy into a fresh directory from a Git checkout, so
  anything written at runtime is gone at the next deploy. Verified: an uploaded
  file present in one version folder was absent from the next.
- `next start` snapshots `public/` **at boot**, so a file written afterwards
  was not served even while it existed — the request fell through to the 404
  page and next/image answered *"The requested resource isn't a valid image."*
  Restarting the process fixed it until the next deploy.

Consequences worth knowing:

- If the five `R2_*` variables are missing, uploads **fail with a visible
  error** rather than falling back to disk. That is deliberate.
- `R2_PUBLIC_URL` must be set in the **build** environment too, not just at
  runtime, or next/image will reject the bucket's hostname.
- Deleting a project in the admin also deletes its object from R2.
- Résumés are unaffected — they are LONGBLOBs inside MySQL and always survived
  deploys.

**No code path writes an uploaded photo to the server's disk any more.** The
upload helper only ever calls R2, and if R2 is unconfigured it returns an error
instead of choosing a fallback. `public/uploads/projects/` still exists as an
empty directory on some machines, left from before the migration; it holds
nothing, git does not track it because it is empty, and it can be deleted. If
you see it, it is a leftover and not evidence that disk storage is still in use.

### Outstanding: orphaned pre-migration rows

Rows created before the migration store a bare filename rather than a URL, and
that file no longer exists, so they render as broken images.
[`scripts/cleanup-orphaned-projects.sql`](scripts/cleanup-orphaned-projects.sql)
selects them for review and then deletes them. **Run it once against the
production database via phpMyAdmin.** It is safe on a clean database — it
matches only rows whose `image_filename` is not an absolute URL, and there are
none of those after the migration.

## Rate limiting and the client IP

Two limits are enforced, both in the app's own memory:

| What | Limit | Counted |
| --- | --- | --- |
| Admin login | 5 per 15 minutes per IP | **failed** attempts only; a successful sign-in clears the record |
| Each public form | 5 per hour per IP | every submission attempt, per form |

Authenticated admin work — browsing tabs, marking read, editing content — is
**not** limited. Only the sign-in attempt itself is.

Counters live in process memory, not Redis, which is the right call at this
traffic scale but has one consequence worth knowing: **a restart or a deploy
clears them**, handing an attacker a fresh budget. Acceptable for slowing down
password guessing; not a substitute for a strong `ADMIN_PASSWORD`.

### Confirm the real client IP is reaching the app

Both limits key on the visitor's IP, taken from `X-Forwarded-For`. Because the
app sits behind Hostinger's proxy, the socket address alone would be the
proxy's, identical for every visitor. If forwarding is misconfigured, one of
two things goes wrong and neither is obvious:

- the app sees one IP for everybody → the first attacker's five failed logins
  **lock out the real admin**
- a visitor can forge the header → the limits never trigger

The header is therefore read from the **right-hand** end, which is the part a
client cannot forge, stepping left one entry per `TRUSTED_PROXY_COUNT` hop.

After deploying, check the app's logs for:

```
[client-ip] No X-Forwarded-For or X-Real-IP header on an incoming request.
```

That warning appears **once per process** if the proxy is not forwarding at
all, and means every visitor is sharing one bucket — fix the proxy config
before relying on the limits. Seeing it locally against `localhost` is normal
and expected.

---

## Do not upgrade Next.js past 16.2.12 (yet)

`next` is pinned to an **exact** `16.2.12` in `package.json`, deliberately, with
no `^`. Anything in 16.3.x fails to build on Hostinger:

```
⚠ Attempted to load @next/swc-linux-x64-gnu, but an error occurred:
  /lib64/libm.so.6: version `GLIBC_2.29' not found
Error: Cannot find module '.../next.config'
ERROR: Failed to build the application
```

Next 16.3's prebuilt SWC binary needs **GLIBC 2.29 or newer**, and the build
image on this plan is older. The build fails, and — this is the part that cost
real time — **the deploy fails silently**: production keeps serving the last
successful build, so the site looks fine while every new commit quietly never
ships. If a change is pushed and does not appear live, check the build log
before suspecting caching or the code.

**`npm audit fix --force` will re-break this.** It bumps `next` to the latest
release to clear the advisories below, which is exactly the change that breaks
the build. This already happened once, in commit `79a3284`, and was reverted in
the commit that added this section.

### The vulnerabilities this pin leaves open

`npm audit` reports **3** high-severity advisories at 16.2.12, all in Next's own
dependency tree. `nanoid` was a fourth, cleared with plain `npm audit fix` — no
`--force`, so `next` never moved. The rest cannot be fixed without bumping
`next`, which is the thing that breaks the build. Honest read of what remains:

| Package | Real exposure here |
| --- | --- |
| `sharp` < 0.35.0 (libvips CVEs) | **The one that matters.** `next/image` runs it at request time on remote and client-uploaded photos. Uploads are admin-authenticated and remote hosts are allowlisted in `next.config.ts`, so it is not open to anonymous input — but it is a genuine runtime path |
| `postcss` ≤ 8.5.22 (sourceMappingURL traversal, stringify XSS) | Build-time only, and only our own `globals.css` passes through it. No untrusted CSS is ever processed |
| `next` itself | Flagged only for depending on the two above, not for a defect of its own. So the real root causes are `sharp` and `postcss` |

Plain `npm audit fix` is safe to run again in future — it only takes in-range
upgrades. It is `npm audit fix --force` that must be avoided.

### Options for fixing it properly

Roughly in order of least disruption:

1. **Check whether a newer Node version in hPanel maps to a newer base image.**
   GLIBC 2.29 is roughly Ubuntu 19.04 / Debian 11 / CentOS 8 and up; CentOS 7,
   still common on older shared plans, ships 2.17.
2. **Build somewhere else and deploy the output.** Run `npm run build` in CI
   (e.g. GitHub Actions) and deploy the `.next` directory, so SWC never has to
   run on Hostinger at all. This sidesteps the GLIBC constraint entirely rather
   than working around it.
3. **Ask Hostinger support** whether a newer build image is available on the
   plan.
4. **Move the app to a host with a current base image.**

There is no middle version to hop to: **16.2.12 is the last 16.2.x release**, so
there is no patch with the fixes backported.

---

## Security headers — NOT yet configured

**There are no security response headers on this site.** `next.config.ts` has
no `headers()` function and `poweredByHeader` is left at its default, so
responses carry `X-Powered-By: Next.js` and none of the usual protections.

Recorded honestly rather than assumed, because it is easy to believe this was
handled: HTTPS is enforced, `/admin` is password-protected and rate limited,
the forms validate and escape their input, and the JSON-LD payload is escaped.
None of that sets a response header.

What is missing, roughly in order of value here:

| Header | Why it matters for this site |
| --- | --- |
| `Strict-Transport-Security` | forces HTTPS on repeat visits, so an admin signing in over a hostile network cannot be downgraded to HTTP |
| `X-Content-Type-Options: nosniff` | stops a browser from reinterpreting an uploaded file as something executable |
| `Referrer-Policy` | keeps full admin URLs out of the `Referer` sent to third parties |
| `X-Frame-Options` / `frame-ancestors` | prevents the admin being framed for clickjacking |
| `Content-Security-Policy` | the most valuable and the most work: the site loads images from Pexels, Unsplash and R2, and fonts from Google, so a policy has to allow those without becoming permissive enough to be pointless |
| `poweredByHeader: false` | removes a free hint about the stack |

None of this is difficult — it is a `headers()` block in `next.config.ts` plus
verification that nothing breaks — but it is a real change with real failure
modes (a wrong CSP silently blanks pages), so it is listed as work rather than
quietly claimed as done.

---

## SEO setup

All of this is in place and verified against a production build.

| Piece | Where | Notes |
| --- | --- | --- |
| `robots.txt` | [`src/app/robots.ts`](src/app/robots.ts) | disallows `/admin`, `/admin/` and `/api/admin/`; ends with the `Sitemap:` line |
| `sitemap.xml` | [`src/app/sitemap.ts`](src/app/sitemap.ts) | the eleven public pages, absolute URLs. An allowlist, so `/admin` cannot leak in |
| `/admin` noindex | [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx) | `robots: { index: false, follow: false }`, belt-and-braces with robots.txt |
| Per-page titles / descriptions | [`src/lib/seo.ts`](src/lib/seo.ts) + each page | unique per page, with canonical and Open Graph tags assembled centrally |
| LocalBusiness structured data | [`src/lib/structured-data.ts`](src/lib/structured-data.ts) | `GeneralContractor` JSON-LD in the root layout, so one node per page. Sourced from `company.ts` |
| Icons and manifest | `src/app/icon.png`, `apple-icon.png`, [`src/app/manifest.ts`](src/app/manifest.ts) | file conventions; the manifest references the 192/512 PNGs |
| Search Console | `verification.google` in [`src/app/layout.tsx`](src/app/layout.tsx) | meta tag on every page |

The domain lives in exactly one place — `siteUrl` in
[`src/data/company.ts`](src/data/company.ts) — and `metadataBase`, the sitemap's
absolute URLs, the `Sitemap:` line in robots.txt and the JSON-LD all read it.
**If the domain changes, edit that one value.**

After a deploy, worth doing once:

- [ ] Submit `https://acornconstruction.ca/sitemap.xml` in Search Console →
      **Sitemaps**
- [ ] Check **Page indexing** reports `/admin` as excluded by robots.txt
- [ ] Run the live URL through Google's Rich Results Test to confirm the
      LocalBusiness data is read as intended (it needs a public URL, so this
      cannot be done before deploying)

---

## Outstanding before this counts as launched

Collected from the sections above, in the order they matter:

1. **Email is not configured** (§ 4). Form notifications reach nobody. Everything
   else about the forms works, which is what makes this easy to miss.
2. **No security headers** ([above](#security-headers--not-yet-configured)).
3. **Repository still on a personal GitHub account** (§ 2).
4. **`scripts/cleanup-orphaned-projects.sql` has not been run** against
   production, so any pre-migration project row still renders as a broken image.
5. **The Next.js pin blocks three known high-severity advisories**
   ([the pin](#do-not-upgrade-nextjs-past-16212-yet)). `sharp` is the one with a
   real runtime path.
6. **No database backups** (below).

---

## Notes for later

- **Backups.** Nothing backs up the database yet. Résumés are stored as BLOBs
  inside MySQL, so a database backup is the only copy of an applicant's file.
  Enable Hostinger's automatic backups, or schedule a `mysqldump`.
- **Résumé storage growth.** Every application adds up to 2.4MB to the database.
  If volume grows, move files to object storage and keep only a reference.
- **Spam beyond rate limiting.** The honeypot plus the per-IP limits above stop
  naive bots and floods from one address. A distributed submitter using many IPs
  would still get through; if that happens, add a CAPTCHA to the three API
  routes.
- **Single shared admin password.** There are no individual accounts and no
  audit trail of who viewed what. Fine for one or two people; revisit if more
  staff need access.
