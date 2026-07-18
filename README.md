# BD Faculty Salaries

A fast, searchable, mobile-friendly site showing crowd-sourced faculty salaries at
private universities in Bangladesh. Fully static — no server, no database, free to host.

Data originally compiled by [Asif Saad](https://asif-saad.github.io/blog/salary-by-faculty/).

---

## The spec (what this is)

- **Goal:** Let anyone browse, search, and sort self-reported faculty salaries, and
  submit corrections/new entries — without us running any backend.
- **Data:** 54 records in [`lib/salaries.ts`](lib/salaries.ts), transcribed from the
  visible rows of the source page (HTML-commented rows excluded). Read-only, shipped
  with the site. Editing that file is how the data changes. Records whose pay is not a
  monthly amount (per-class / per-course / per-semester) have `total: null` and are
  excluded from the median/highest stats.
- **Submissions:** handled by an **external form** (Google Form / Tally), not by our code.
  The "Submit / update info" button links to `SITE.submitFormUrl` in
  [`lib/config.ts`](lib/config.ts).
- **Non-goals:** user accounts, live editing, a database, an admin panel. A 54-row
  read-only dataset does not need them.

## Tech stack (and why)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript** | Industry-standard React framework. |
| Styling | **Tailwind CSS v4** | Fast, consistent, dark-mode built in. |
| Data | **Plain typed TS array** | 54 rows don't need a DB. Type-safe, zero infra. |
| Hosting | **Static export → GitHub Pages / Vercel** | Free. No server to run. |

## Run it locally

```bash
npm install
npm run dev       # http://localhost:3000
```

## Verify (run before you ship)

```bash
npm run verify    # typecheck + lint + static build
```

If `verify` passes, the site is type-safe, lint-clean, and builds to static HTML in `out/`.

## Deploy for free

### Option A — GitHub Pages (included workflow)
1. Push this folder to a GitHub repo.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
   and publishes to `https://<user>.github.io/<repo>/`.

### Option B — Vercel
1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Accept defaults. Done — you get a free `*.vercel.app` URL.

## Wire up submissions (5 minutes)

1. Create a **Google Form** (or a nicer [Tally](https://tally.so) form) with fields:
   University, Designation, Location, Salary breakdown, Facilities, Month/Year.
2. Copy its share URL.
3. Paste it into `submitFormUrl` in [`lib/config.ts`](lib/config.ts).

To fold new submissions into the site, add rows to [`lib/salaries.ts`](lib/salaries.ts)
and push — the deploy workflow rebuilds automatically.
