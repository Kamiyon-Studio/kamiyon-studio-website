# Kamiyon Studio — Technical SEO & Google Search Console

Production site: **https://kamiyonstudio.com**  
Canonical host: **kamiyonstudio.com** (HTTPS, apex, no trailing slash)

This document describes the technical SEO foundation in this repository and the **manual Google / Cloudflare steps** that cannot be automated without your account access.

---

## 1. What was fixed / improved

Existing foundation (already present before this pass) was preserved:

- App Router `app/robots.ts` + fail-closed `lib/seo/robots-policy.ts`
- App Router `app/(frontend)/sitemap.ts` + `lib/seo/sitemap-entries.ts`
- Shared `buildPageMetadata()` for title / description / canonical / OG / Twitter
- Organization + FAQ + Breadcrumb JSON-LD builders
- Production crawl gates via `NEXT_PUBLIC_SITE_URL` + `APP_ENV`

Improvements in this pass:

| Area | Change |
| --- | --- |
| Robots | Also disallow `/motion-lab` (lab route is already `noIndex`) |
| Sitemap | Include indexable `/blog/{slug}` posts from CMS/fallback |
| Organization JSON-LD | Add `@id`, `url`, `logo` on the canonical origin |
| WebSite JSON-LD | New site-wide schema linked to Organization |
| Breadcrumb JSON-LD | Absolute `item` URLs (was relative) |
| Blog posts | Pass `ogImage` / featured image into metadata; emit BlogPosting + Breadcrumb JSON-LD |
| Tooling | `pnpm seo:check`, Search Console scripts, weekly GitHub Action |
| Docs / env | This file + Search Console placeholders in `.env.example` |

---

## 2. What is automated

| Command | What it does |
| --- | --- |
| `pnpm seo:check` | Offline validation of robots policy, sitemap builder, canonical origin, JSON-LD syntax |
| `pnpm seo:check -- --live` | Also fetches production `/robots.txt`, `/sitemap.xml`, homepage canonical + Organization JSON-LD |
| `pnpm seo:auth` | Verifies Search Console API credentials can see the configured property |
| `pnpm seo:sitemap` | Lists sitemaps in Search Console |
| `pnpm seo:sitemap -- --submit` | Submits `https://kamiyonstudio.com/sitemap.xml` |
| `pnpm seo:inspect` | URL Inspection API for core URLs (or CLI URL args) |
| `pnpm seo:report` | Readable report; refuses to invent performance/indexing data without API access |
| `pnpm seo:oauth-setup` | One-time helper to obtain an OAuth refresh token |
| `.github/workflows/seo-check.yml` | Weekly + manual CI: unit tests for `lib/seo`, `seo:check`, live check, optional GSC report |

Runtime SEO continues to ship with each production deploy (`robots.txt` / `sitemap.xml` prerendered with `APP_ENV=production` and `NEXT_PUBLIC_SITE_URL=https://kamiyonstudio.com`).

---

## 3. What you must do manually

### Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add a **Domain** property: `kamiyonstudio.com` (preferred over URL-prefix).
3. Choose **DNS verification**.
4. Google shows a **TXT record** value (unique token). Copy it.
5. Create that TXT record in Cloudflare DNS (see below).
6. Click **Verify** in Search Console.
7. After verification:
   - Confirm sitemap URL: `https://kamiyonstudio.com/sitemap.xml`
   - Or run `pnpm seo:sitemap -- --submit` once API credentials are configured.
8. Request indexing for key URLs only after verification (homepage, services, about, contact). Do not mass-spam URL inspection.

> This repository cannot invent or bypass your verification token. DNS ownership proof requires your Google + Cloudflare login.

### Cloudflare

**DNS verification (required for Domain property):**

1. Cloudflare Dashboard → zone `kamiyonstudio.com` → **DNS** → **Records**.
2. Add record:
   - Type: `TXT`
   - Name: `@` (or `kamiyonstudio.com`, per Cloudflare UI)
   - Content: the exact value Google Search Console shows
   - Proxy status: DNS only (TXT is never proxied)
3. Wait for DNS propagation, then verify in Search Console.

**Recommended SEO-related Cloudflare settings (manual review — do not change blindly):**

| Setting | Expected for SEO |
| --- | --- |
| SSL/TLS | Full (strict) if origin certs are valid |
| Always Use HTTPS | On |
| `www` | Currently `www.kamiyonstudio.com` does not resolve. Either keep apex-only **or** add a `www` CNAME/A + 301 redirect to apex. Domain property covers both once DNS exists. |
| Bot Fight / WAF | Do not block Googlebot. If challenging bots, allowlist Google crawlers. |
| Caching | Ensure `/robots.txt` and `/sitemap.xml` remain reachable (200). If HTML is heavily cached, purge after major content/SEO deploys. |
| Workers / redirects | Avoid rules that rewrite `/robots.txt` or `/sitemap.xml` away from the Next/OpenNext Worker response. |

Do **not** disable Cloudflare security features just for SEO.

### Environment variables

Local (`.env.local` — never commit):

```bash
# Already required for correct local metadata when testing production-like builds:
NEXT_PUBLIC_SITE_URL=https://kamiyonstudio.com
APP_ENV=production

# Search Console API — pick ONE auth method:
GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:kamiyonstudio.com
GOOGLE_SEARCH_CONSOLE_SITEMAP_URL=https://kamiyonstudio.com/sitemap.xml

# Service account (recommended for CI):
GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL=
GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY=

# OR OAuth refresh token (local):
GOOGLE_SEARCH_CONSOLE_CLIENT_ID=
GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET=
GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN=
```

GitHub Actions (optional, for weekly GSC report):

- Secrets: `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL`, `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY`  
  and/or OAuth secrets listed above
- Variable (optional): `GOOGLE_SEARCH_CONSOLE_SITE_URL`

### OAuth / API

**Service account path (recommended):**

1. Google Cloud Console → create/select a project.
2. Enable **Google Search Console API**.
3. Create a service account → download JSON key (keep offline; never commit).
4. In Search Console → Settings → Users and permissions → add the service account email (at least Full).
5. Map JSON fields into env:
   - `client_email` → `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY` (keep `\n` newlines)

**OAuth path (local interactive):**

1. Google Cloud Console → OAuth Desktop client.
2. Enable **Google Search Console API**.
3. Set client id/secret in `.env.local`.
4. Run `pnpm seo:oauth-setup` and store the refresh token in `.env.local`.
5. Ensure the Google user is an owner/user on the Search Console property.

Then:

```bash
pnpm seo:auth
pnpm seo:sitemap -- --submit
pnpm seo:inspect
pnpm seo:report
```

---

## 4. Architecture notes

### Crawlability

- Production allowlist: public pages allowed; `/admin`, `/api/`, `/studio`, `/motion-lab` disallowed.
- Staging / non-canonical hosts: `Disallow: /` and empty sitemap (fail-closed).
- Archived IA (`/products`, `/community`) permanently redirects to `/`.

### Metadata

All indexable routes should use `buildPageMetadata()` from `lib/seo/metadata.ts` so canonical + OG/Twitter stay consistent. CMS `seo.noIndex` excludes pages from indexing intent and from sitemap inclusion.

### Structured data

| Schema | Where |
| --- | --- |
| Organization | Root layout (all pages) |
| WebSite | Root layout (all pages) |
| FAQPage | Contact page when FAQ content exists |
| BreadcrumbList | Service / portfolio / blog detail |
| BlogPosting | Blog detail |

Schemas only use facts present in CMS/canon (`docs/`, `lib/seo/constants.ts`, contact channels). No fabricated awards, clients, or stats.

### Images

- Prefer CMS `seo.ogImage` for nested routes.
- Home uses generated `opengraph-image.tsx` / `twitter-image.tsx`.
- Decorative UI images intentionally use empty `alt=""`; content images use CMS alt or title fallbacks.

---

## 5. Commands

```bash
# Technical validation (CI-safe)
pnpm seo:check
pnpm seo:check -- --live

# Search Console (requires credentials)
pnpm seo:auth
pnpm seo:sitemap
pnpm seo:sitemap -- --submit
pnpm seo:inspect
pnpm seo:inspect -- https://kamiyonstudio.com/about
pnpm seo:report
pnpm seo:report -- --days=28
pnpm seo:oauth-setup
```

Package manager for this repo is **pnpm**. `npm run seo:check` also works if you prefer npm script entrypoints, but install/lockfile workflows should stay on pnpm.

---

## 6. Verification checklist

| Check | How |
| --- | --- |
| robots.txt | Open https://kamiyonstudio.com/robots.txt — expect `Allow: /`, sitemap line, no blanket `Disallow: /` |
| sitemap.xml | Open https://kamiyonstudio.com/sitemap.xml — HTTPS apex URLs only |
| Canonical | View source on a page → `<link rel="canonical" href="https://kamiyonstudio.com/...">` |
| Metadata | View source → `<title>`, meta description, `og:*`, `twitter:*` |
| JSON-LD | View source → `application/ld+json` blocks; validate with Google Rich Results Test if desired |
| Search Console | Property verified; sitemap submitted; Coverage/Pages report healthy over time |
| Indexing | Only trust Search Console URL Inspection / Pages report — never assume from sitemap presence alone |

Local confirmation:

```bash
pnpm exec vitest run lib/seo
pnpm seo:check
pnpm seo:check -- --live
```

---

## 7. Remaining issues / honesty limits

- Google ownership verification **requires your DNS action** — not done by this repo.
- URL indexing state is unknown until Search Console API credentials are configured and Google crawls the site.
- Nested routes without CMS `seo.ogImage` may lack a dedicated OG image (home still has the generated OG route).
- `www` is not configured DNS-wise today; choose apex-only or add www→apex redirect deliberately.
- Search performance metrics will be empty/low for a new or lightly indexed property — that is expected.
- Do not claim “100% SEO optimized.” Technical foundations can be sound while rankings still depend on content, links, and crawl history.
