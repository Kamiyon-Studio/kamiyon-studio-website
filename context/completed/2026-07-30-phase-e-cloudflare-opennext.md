# Phase E — Cloudflare OpenNext + R2 + webhooks + kinetic nav (2026-07-30)

## Goal

Migrate the Next.js marketing site to Cloudflare Workers via OpenNext (staging/prod, R2 media + cache, Sanity revalidate webhook, CF Web Analytics) and replace production chrome with Kamiyon-branded GSAP kinetic overlay nav.

## Delivered (Tracks A–G + Waves 2–3)

| Track | Outcome |
| --- | --- |
| A Scaffold | `wrangler.jsonc`, `open-next.config.ts`, deploy scripts, `_headers`, `APP_ENV`, media remotePatterns |
| B Media | `POST /api/media/upload`, R2 helpers, Studio `r2Asset`, unit tests |
| C Revalidate | `lib/cms/revalidate-tags.ts`, `POST /api/revalidate`, unit tests |
| D Analytics | Beacon gated by `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` (ADR-012) |
| E CI/Docs | `.github/workflows/deploy.yml`, `.env.example`, `deploy-runbook.md` |
| F Infra | R2 buckets + media custom domains Active |
| G Kinetic nav | `SterlingGateKineticNavigation` + `SiteHeader` wrapper; PageShell wired |

**Wave 2:** Bindings point at real buckets; typegen; preview/build path documented (Windows symlink caveat).

**Wave 3:** Staging Worker live — https://kamiyon-studio-website-staging.limosnerosherwin.workers.dev  
Hosted Studio — https://kamiyon.sanity.studio/ (ADR-007). Staging revalidate webhook live.

## Wave 4 status (2026-07-30)

| Step | Status |
| --- | --- |
| Prod Worker on `*.workers.dev` | **Live** — re-smoked 2026-07-30 (`200` pages, `/studio` 307, APIs `401` without secret) |
| Prod secrets | `MEDIA_UPLOAD_SECRET`, `SANITY_REVALIDATE_SECRET` present |
| Sanity CORS for apex + www | **Done** 2026-07-30 (`sanity cors add` with credentials) |
| Attach custom domains | **Pending operator** — Worker domains list empty; apex/`www` still Vercel CNAMEs |
| Prod revalidate webhook | **Pending** (needs apex live + prod Bearer) |
| Studio bake → prod upload origin | **Pending** after DNS |
| Pause Vercel | **Pending** after 24–48 h green |

Do not change production DNS from agents — follow [`dns-cutover-guide.md`](../dns-cutover-guide.md).

## Tickets closed

- **T4** R2 media model + Studio upload + `getMediaUrl`
- **T5** OpenNext Cloudflare deploy + env docs
- **T6** Sanity webhook → `revalidateTag` (staging live; prod after cutover)
- **T14** Cloudflare Web Analytics snippet (code done; token build var operator)

## Related ADRs

- ADR-007 / ADR-009 — Hosted Studio
- ADR-008 — Kinetic nav
- ADR-012 — Web Analytics beacon
- ADR-022 — Phase E closeout

## Verification (2026-07-30)

- Vitest Phase E surfaces: 33/33 pass (`media/upload`, `revalidate`, kinetic nav, analytics)
- Prod workers.dev smoke: `/` `/about` `/services` `/contact` `/portfolio/eclipse` `200`; `/studio` `307`; `/api/revalidate` + `/api/media/upload` `401` unauthenticated
- Apex `kamiyonstudio.com` still `308`/`CNAME` → Vercel until WS4b

## Follow-ups (Phase F / operator)

1. WS4b DNS cutover + prod webhook + Studio origin bake + Vercel pause
2. GitHub Actions secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (confirm in repo Settings)
3. Optional `staging` git branch for CI branch map (currently only `main` / `test` remotes)
4. Analytics site tokens as build variables
5. T8 Resend domain verify; T9 blog UI; T15 E2E expansion
