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

   Expected: `career_applications`, `contact_submissions`, `estimate_requests`.

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
| `APP_URL` | the live site's base URL, e.g. `https://acornconstruction.ca` — notification emails build their "View in Dashboard" link from this, so leaving it unset makes those links point at localhost |
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

## 6. Set `metadataBase` to the real domain

Once the domain is finalised, edit [`src/app/layout.tsx`](src/app/layout.tsx)
and add `metadataBase` to the `metadata` export, replacing the
`PRE-LAUNCH BLOCKER` comment:

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://acornconstruction.ca"),
  title: "Acorn Construction | Residential, Commercial & Post Frame Builders",
  // ...
};
```

Until this is done, Next.js resolves the relative Open Graph and Twitter image
paths against `http://localhost:3000`, so **every shared link has a broken
preview image**. Commit and redeploy after changing it.

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
- [ ] **Social preview** — paste the homepage URL into a link-preview debugger
      and confirm the image resolves (this fails if step 6 was skipped).

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

## Notes for later

- **Backups.** Nothing backs up the database yet. Résumés are stored as BLOBs
  inside MySQL, so a database backup is the only copy of an applicant's file.
  Enable Hostinger's automatic backups, or schedule a `mysqldump`.
- **Résumé storage growth.** Every application adds up to 2.4MB to the database.
  If volume grows, move files to object storage and keep only a reference.
- **No rate limiting.** The honeypot stops naive bots, but nothing throttles a
  determined submitter. If spam gets through, add per-IP rate limiting or a
  CAPTCHA on the three API routes.
- **Single shared admin password.** There are no individual accounts and no
  audit trail of who viewed what. Fine for one or two people; revisit if more
  staff need access.
