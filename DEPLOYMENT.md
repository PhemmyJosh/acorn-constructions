# Deployment checklist

Everything that has to happen once Hostinger hosting is actually purchased, in
order. Nothing in this file can be done before the account exists.

The site **requires Node hosting**, not static hosting: `/admin` and the three
`/api/*` routes are server-rendered on demand, and `next/image` uses the default
optimizing loader. A static export is not an option without removing those.

---

## 1. Purchase the hosting plan

Choose a Hostinger plan that includes **Node.js application hosting**, a
**MySQL database**, and **business email mailboxes**. The Business plan is the
usual fit; the cheapest shared/static tiers will not run this app.

Confirm before paying:

- [ ] Node.js apps supported, with a version of **Node 20 or newer** available
      (Next.js 16 requires it)
- [ ] At least one MySQL database included
- [ ] At least one email mailbox included on the domain
- [ ] Free SSL / Let's Encrypt included

---

## 2. Create the Node.js web app and connect GitHub

In hPanel:

1. **Websites → Add website → Node.js app** (or *Advanced → Node.js* on some
   plan layouts).
2. Set the Node version to 20+.
3. Connect the GitHub repository `PhemmyJosh/acorn-constructions`, branch
   `master`, and authorise Hostinger's GitHub app.
4. Set the build and start commands:
   - Install: `npm ci`
   - Build: `npm run build`
   - Start: `npm run start`
5. Confirm the app's listening port comes from `process.env.PORT` — `next start`
   already honours it, so no code change is needed.

Do **not** deploy yet. The environment variables in step 5 must exist first, or
the first boot will fail against a missing database.

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
   has today, rather than an empty Content tab:

   ```bash
   node scripts/seed-content.mjs
   ```

   Safe to re-run — it only fills tables that are empty and never overwrites
   anything edited through the admin. Until it runs (or if it is skipped), the
   site falls back to the copy compiled into `src/data/`, so nothing breaks
   either way.

---

## 4. Create the business email mailbox and get SMTP credentials

1. **hPanel → Emails → Email Accounts → Create email account**, e.g.
   `mark@acornconstruction.ca` (this is the address already used throughout
   `src/data/company.ts`).
2. From the mailbox's **Configuration / Connect devices** panel, note the
   outgoing SMTP settings. For Hostinger's Titan mail these are typically:
   - host `smtp.hostinger.com`
   - port `465` with SSL/TLS
   - username: the full email address
   - password: the mailbox password
3. Consider a second mailbox (e.g. `noreply@`) to send from, keeping `mark@` as
   the delivery destination. If you do, `SMTP_USER` is the noreply address and
   `NOTIFY_EMAIL` stays `mark@`.

The app selects TLS automatically: port `465` connects secure, anything else
starts plain and upgrades.

---

## 5. Set production environment variables

**hPanel → your Node app → Environment variables.** Set every one of these.
Leaving `SMTP_HOST` blank in production would silently route notifications to a
throwaway Ethereal test inbox instead of real email.

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
- `public/uploads/projects/` is kept only so any pre-migration row still tidies
  up after itself. Once `scripts/cleanup-orphaned-projects.sql` has run, it can
  be deleted.

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
