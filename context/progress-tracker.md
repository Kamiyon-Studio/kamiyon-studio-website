# Progress Tracker

Update this file after every meaningful implementation change.

## Archival process

When a task/phase is marked complete:

1. Create `context/completed/YYYY-MM-DD-<slug>.md` with the finished context.
2. Add a row/link in [`completed/README.md`](./completed/README.md).
3. Remove bulky finished blocks from this file; leave at most a one-line pointer.
4. Do not delete historical detail — relocate it.

**Historical completed work:** [`completed/README.md`](./completed/README.md)

---

## Current Phase

### IA consolidation + Sanity cleanup (2026-07-29) — implemented, uncommitted

**Plan:** `.claude/plans/6-page-ia-consolidation-sanity-cleanup.plan.md` · **ADR:** ADR-017

| Phase | Status |
| --- | --- |
| 1 Taxonomy constants | Done (`lib/cms/taxonomies.ts`, Gate 0 five + blog strings) |
| 2 Sanity schema / Archive desk | Done (`portfolio`, readOnly archived types) |
| 3 lib/cms + seed rewrite | Done (portfolio getters; archived types not seeded) |
| 4 IA routes / redirects / sitemap | Done (`_archive/`, 301 → `/`) |
| 5 Nav dropdowns | Done (Services + Portfolio from CMS) |
| 6 Tests / e2e smoke | Updated |
| 7 Docs | Done (this tracker + DECISIONS + essential §7) |
| 8 Commit | **Not done** — left for human review |

### Services refactor — Gate 3 PASS_WITH_NOTES (2026-07-29)

**Artifact:** [`gate0-services-taxonomy.md`](./gate0-services-taxonomy.md) · **ADR:** ADR-016 (+ Gate 1 live-remap + Gate 3 closeout) in [`DECISIONS.md`](./DECISIONS.md)

| Gate / stream | Status | Notes |
| --- | --- | --- |
| **Gate 0** | **READY** | Taxonomy, remap, redirects, ownership, removals locked |
| **WS-A** Schema & Studio | **Done** | Flat five `service`; Studio structure; schema extract |
| **WS-B** Content canonical | **Done** | Types, fallbacks, seed builders for five services |
| **WS-C** Migration script | **Done (dry-run only)** | Matrix + 29 tests; live dry-run passed; **APPLIED=NO** |
| **Gate 1** | **READY** | `schema.json` regenerated; Service contracts green; live remaps folded into Gate 0 artifact |
| **WS-D** GROQ / mappers | **Done** | Flat service GROQ / fetchers / `mapService` + canonical sort; GROQ slug list derived from `SERVICE_CATEGORIES` |
| **WS-E** Services frontend | **Done** | Flat listing/detail; tagline + capabilities; no category chrome |
| **WS-F** Portfolio filters | **Done** | Client chips + service-type linking over five slugs |
| **WS-G** Redirects / SEO | **Done** | Gate 0 + live remap paths in `next.config`; sitemap uses `getServices` |
| **Gate 2** | **READY** | Shared wiring verified; **no `--apply` run** |
| **WS-H** Dead-code cleanup | **Done** | Removed category stubs; FAQ/about copy aligned to five offerings |
| **Gate 3** | **PASS_WITH_NOTES** | Vitest **614/614**; Playwright **18/18** (fresh build); migrate security PASS; `--apply` still awaiting human |

**Hard rules:** No live/prod CMS `--apply` without human dry-run sign-off. Optional `--apply` is ready for **non-prod only** after human approval. Unknown slugs outside Gate 0 + live extensions → STOP.

**Gate 3 apply note:** WS-C migrate `--apply` was **not** executed. Awaiting human dry-run sign-off before any non-prod dataset mutation. Production mutation remains forbidden. Until apply, live dataset may still contain legacy service docs; app code filters to the canonical five via GROQ + mappers + fallbacks.

---

**Phase E — Wave 3 verified (2026-07-24):** Staging Worker + hosted Studio confirmed working. **Wave 4 (apex DNS cutover) is next**, run **in parallel** with QA polish streams (see below).

| Surface | URL | Status |
| --- | --- | --- |
| Staging site | https://kamiyon-studio-website-staging.limosnerosherwin.workers.dev | Live (Workers Free ~2.2 MiB gzip) |
| Hosted Studio | https://kamiyon.sanity.studio/ | Live (login + desk OK) |
| Staging `/studio` | same Worker → redirect | → hosted Studio |
| Media CDN (staging) | https://media-staging.kamiyonstudio.com | Active |
| Media CDN (prod) | https://media.kamiyonstudio.com | Active |
| Production Worker (no domain yet) | https://kamiyon-studio-website.limosnerosherwin.workers.dev | Live + smoked 2026-07-26; awaiting DNS attach |
| Production site | https://kamiyonstudio.com | Still on prior host until Wave 4 |

**Source of truth:** [`WEBSITE-ESSENTIAL-CONTEXT.md`](./WEBSITE-ESSENTIAL-CONTEXT.md) · [`DECISIONS.md`](./DECISIONS.md) · [`deploy-runbook.md`](./deploy-runbook.md) · [`QA-Report.md`](./QA-Report.md)

---

## Locked product answers (2026-07-24)

| Topic | Decision |
| --- | --- |
| Interim contact CTA | External [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSeIefAWJu5FP9pwljLFz1wSUxU2ybR3--GdylUYUBsGHH0yaw/viewform) (linked button) |
| Google Form CTA after T8 | **Retain** — “Get in touch” / chrome button stays on the Google Form; do not retire or re-point `INTERIM_CONTACT_FORM_URL` when native Resend form ships |
| QA-001 | Out of app scope — Google Forms confirmation settings |
| Same-route nav | Smooth-scroll to top / target section |
| Scroll tip | Keep bounce UX; first scroll must count |
| QA-008 hamburger | Superseded by kinetic nav (ADR-008) |
| QA vs Wave 4 | Parallel |
| T8 (later) | Resend → studio inbox + visitor confirmation; confirm `CONTACT_TO_EMAIL` |

---

## Parallel workstreams (multitask fan-out)

```text
Batch 1 (now, no shared files):
  WS0 Context hygiene     ── done 2026-07-24
  WS1 Hero scroll/hint    ── done 2026-07-24 (QA-002, 009, 010)
  WS2 Kinetic chrome QA   ── done 2026-07-24 (QA-003 fixed; QA-004 N/R)
  WS4a Staging ops        ── done 2026-07-24
  WS6 Blog/Analytics      ── T9 / T14 (optional)

Batch 2 (after Batch 1 + policy locked):
  WS3 Same-route scroll   ── done 2026-07-24 (QA-005, 006, 007 + Google Form CTA)

Batch 3 (serial ops):
  WS4b Wave 4 DNS cutover

Batch 4:
  WS5 T8 Resend form (after inbox confirmed; prod secrets after WS4b)
  WS7 E2E T15 (after WS3 + WS5)

Batch S (CMS seed — done 2026-07-24):
  WS8a–f Sanity content seed ── partner schema + builders + CLI + live upsert (ADR-011)
```

| Stream | Scope | Owns (avoid cross-edits) | Depends on | Status |
| --- | --- | --- | --- | --- |
| **WS0** | Context triage | `context/*` | — | **Done** |
| **WS1** | First scroll counts; × dismiss | `useHeroScrollBounce*`, `HeroScrollHelper*` | — | **Done** — tip dismisses on first intent (no return-to-top); × + pointer-events isolation |
| **WS2** | Re-QA logo on kinetic; fix if repro | `sterling-gate-kinetic-navigation*`, `SiteHeader*` | Soft: WS1 if tip steals clicks | **Done** — QA-003 fixed (frosted logo chrome on dark hero); QA-004 cannot repro (hits OK; tip stacking owned by WS1) |
| **WS3** | Same-route → scroll; wire Google Form CTA | nav helpers, footer, contact CTAs, `lib/config/navigation`, channels/fallbacks | WS1/WS2 soft; answers locked | **Done** — same-route `SameRouteLink` + helpers; interim Google Form as primary CTA |
| **WS4a** | Staging webhook + Studio API origin / R2 smoke | CF/Sanity ops, `deploy-runbook` | — | **Done** |
| **WS4b** | Apex/www → prod Worker; pause Vercel | DNS + prod env | WS4a green | **Prod Worker live + smoked** 2026-07-26 on `kamiyon-studio-website.limosnerosherwin.workers.dev`; remaining work is operator dashboard steps (DNS attach, Sanity CORS/webhook, Vercel pause) |
| **WS5** | T8 Resend native form | contact API + UI | Inbox decision; prod after WS4b | Later |
| **WS6** | T9 blog UI / T14 CF Analytics | blog routes, analytics snippet | — | Optional parallel |
| **WS7** | T15 E2E expansion | `e2e/*` | WS3 + WS5 | Later |
| **WS8** | Sanity seed (fallbacks → dataset) | `scripts/sanity/seed/*`, `partner` schema, `lib/cms` partner plumbing | — | **Done** — 42 docs on `kamiyon` (ADR-011) |

**Conflict edge:** Hero tip `z-20` vs header logo clicks — WS1 owns tip stacking; WS2 re-tests logo after.

**WS4b handoff:** Production Worker created and verified 2026-07-26 at https://kamiyon-studio-website.limosnerosherwin.workers.dev (pages, `/studio` redirect, hashed OG image, apex `robots.txt`/canonicals, `401` on unauthenticated `/api/revalidate` + `/api/media/upload`, prod media CDN). Worker secrets are set. All that is left is the **human** dashboard work: attach `kamiyonstudio.com` + `www`, add the production Sanity CORS origin and revalidate webhook, redeploy the Studio at the apex origin, then pause Vercel after 24–48 h green. Operator-facing steps: [`dns-cutover-guide.md`](./dns-cutover-guide.md); engineer sequence and smoke results: [`deploy-runbook.md`](./deploy-runbook.md).

---

## Current Goal

1. **Services refactor:** Gate 3 **PASS_WITH_NOTES**. Human may approve **non-prod** WS-C `--apply` to prune legacy CMS docs.  
2. Ops (parallel): **WS4b** apex DNS cutover → then WS5/WS7.  
3. Optional: WS6 blog UI (T9); T14 analytics already done.

---

## Recently completed (2026-07-24)

- **WS8 Sanity content seed** — Partner schema + `pnpm sanity:seed` (42 docs); fallbacks kept; `getCmsImageUrl` allowlists media CDN. Archive: [`completed/2026-07-24-sanity-content-seed.md`](./completed/2026-07-24-sanity-content-seed.md) (ADR-011).
- **WS3 same-route scroll + Google Form CTA** — Shared `lib/navigation/same-route-scroll` + `SameRouteLink` (header/footer/CTAs); interim primary CTA → Google Form (`INTERIM_CONTACT_FORM_URL` / `CONTACT_CTA`); `/contact` nav page kept for channels. Resolves QA-005/006/007 (external Form skips same-route scroll).
- **WS2 kinetic chrome QA** — QA-003: frosted logo chrome so ink wordmark readable on dark hero; QA-004: cannot repro as hit-target (logo hits OK; tip stacking = WS1). No new menu freezes under toggle stress.
- **WS4a staging ops** — Sanity webhook → staging `/api/revalidate` (Bearer); Studio redeploy with `SANITY_STUDIO_API_ORIGIN` + upload secret; R2 API smoke OK. Details: [`deploy-runbook.md`](./deploy-runbook.md).
- **WS0 context hygiene** — QA triage, workstreams, contact/Studio doc alignment (ADR-010).
- **Hosted Studio live** — `pnpm sanity:deploy` → https://kamiyon.sanity.studio/ (app id in `sanity.cli.ts`).
- **Studio env bake-in (ADR-009)** — static `SANITY_STUDIO_*` reads + defaults.
- **Sanity CORS** — credentials for Studio + staging Worker.
- **Kinetic nav (Track G / ADR-008)** — `SterlingGateKineticNavigation` in `SiteHeader`.
- **OpenNext staging** — R2 bindings, staging vars, secrets set.
- **Build fixes** — `next build --webpack` + `*.ttf.bin` loader; OG routes on node runtime.

---

## Completed earlier

- Phase C CMS swap — [`completed/2026-07-23-phase-c-sanity-cms-swap.md`](./completed/2026-07-23-phase-c-sanity-cms-swap.md)
- Cinematic footer — [`completed/2026-07-23-cinematic-footer.md`](./completed/2026-07-23-cinematic-footer.md)
- Phase B Studio schemas; ADR-005 hygiene; ADR-007 hosted Studio (not embedded)

---

## Next Up (resume here)

### Services refactor (Gate 3 closed)

0. ~~**Gate 0** — Taxonomy, remap, redirects, ownership~~ **READY** — [`gate0-services-taxonomy.md`](./gate0-services-taxonomy.md) · ADR-016  
1. ~~**WS-A ∥ WS-B ∥ WS-C** — Schema/Studio · fallbacks/seed · migration dry-run~~ **Done** (C: dry-run only, APPLIED=NO)  
2. ~~**Gate 1** — Types/contracts → unlock WS-D/E/F/G~~ **READY** — schema extract + live remap fold-in  
3. ~~**WS-D ∥ WS-E ∥ WS-F ∥ WS-G** — GROQ/mappers · services UI · portfolio filters · redirects/SEO~~ **Done**  
4. ~~**Gate 2** — Shared wiring + full unit suite~~ **READY** (2026-07-29) — **`--apply` not run**  
5. ~~**WS-H** — Dead code / knip cleanup for old services taxonomy leftovers~~ **Done** (2026-07-29)  
6. ~~**Gate 3** — E2E / final review~~ **PASS_WITH_NOTES** (2026-07-29) — vitest 614/614; Playwright 18/18; migrate security PASS; apply still human-gated  
7. **Human:** optional non-prod `migrate-services --apply` after dry-run sign-off (prod still forbidden)

### Batch 1 (parallel)

1. ~~**WS1** — Hero scroll bounce: first intent must scroll; stabilize tip × (QA-002/009/010)~~ **Done**
2. ~~**WS2** — Re-QA logo disappear/click~~ **Done** (QA-003 frosted chrome; QA-004 N/R as hit bug)
3. ~~**WS4a** — Staging webhook + Studio R2 origin + API smoke~~ **Done** (see deploy-runbook)
4. **WS6 (optional)** — Blog UI (T9) / ~~CF Analytics (T14)~~ **T14 done 2026-07-26** — beacon + dev/no-token off switch (ADR-012); operator must set `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN_{STAGING,PRODUCTION}` per [`analytics-setup.md`](./analytics-setup.md)

### Batch 2

5. ~~**WS3** — Same-route → scroll top/section; wire Google Form as interim primary contact CTA~~ **Done**

### Batch 3–4

6. **WS4b** — ~~Prod Worker~~ **deployed + smoked 2026-07-26**; remaining: attach `kamiyonstudio.com` + `www`, prod Sanity CORS + webhook, Studio redeploy at apex origin, pause Vercel — all need operator dashboard access (see [`deploy-runbook.md`](./deploy-runbook.md) “WS4b — Production cutover”, operator steps in [`dns-cutover-guide.md`](./dns-cutover-guide.md))
7. **WS5** — T8 Resend form (after `CONTACT_TO_EMAIL` confirmed)
8. **WS7** — Expanded E2E (T15); retire CardNav-era smoke comments
9. **GitHub Actions** — Confirm `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` for `staging`/`main`

**Done (pointers):** see [`completed/README.md`](./completed/README.md)

---

## Open Questions

Only genuinely pending decisions live here. Decided-but-unscheduled work is under **Deferred** below; settled items are under **Resolved**.

- [ ] **Resend from-address / `CONTACT_TO_EMAIL`** — Plan locked 2026-07-26: send as `Kamiyon Studio <noreply@send.kamiyonstudio.com>` (dedicated sending subdomain keeps transactional reputation off the apex); `CONTACT_TO_EMAIL=kamiyonstudio@gmail.com` (already `PUBLIC_EMAIL`); add Cloudflare Email Routing so `hello@kamiyonstudio.com` forwards to that Gmail. Never send as `gmail.com` — Resend requires a verified domain and it fails DMARC.  
  Remaining before WS5: verify the subdomain in Resend (DKIM + SPF), add apex DMARC at `p=none` with `rua`, add `CONTACT_FROM_EMAIL` to `.env.example`, keep `RESEND_API_KEY` a Worker **secret**. Reply-to = visitor address on the studio notification, `PUBLIC_EMAIL` on the visitor confirmation.  
  **Sequencing:** zone is already on Cloudflare and currently has **no MX / SPF / DMARC**, so this is independent of WS4b and nothing conflicts. Domain verification is the long-lead step — start it **before** WS4b.

---

## Deferred — decided, not scheduled

| Item | Decision | Revisit trigger |
| --- | --- | --- |
| **Press Kit** (`/pres`) | Vision item per [`ai-workflow-rules.md`](./ai-workflow-rules.md) — out of v1. Interim need is served manually: brand assets in `docs/assets/` + `PUBLIC_EMAIL`. | First real press inquiry, or first product launch |
| **Portfolio taxonomy filters** | Approach locked: client-side chips over the existing `caseStudy.industry` field, reusing the `CommunityFeed` + `lib/community/filter-by-type` pattern (chips derived only from values present). No new routes, no schema change, no CMS migration. | ≥6 real (non-placeholder) case studies across ≥3 industries |

Portfolio currently holds **1** case study, `isPlaceholder: true` — chips over a single placeholder card would read as broken, which is why filters wait on content rather than engineering.

---

## Resolved (formerly open)

- [x] **`/news` route** — **Won't build.** `/blog` (T9) is the announcements surface; its own metadata already reads "News and updates from Kamiyon Studio." `/news` originated in the superseded `website-plan/` v2.0 IA and never shipped, so no redirect is needed.
- [x] **README motto conflict** — Fixed 2026-07-26: `docs/README.md` now reads **Create. Play. Inspire.**, matching `docs/company/overview.md`, `docs/company/mission-vision.md`, the branding docs, root `README.md`, and `SITE_MOTTO`. No code impact (nothing read the old string).
- [x] **R2 public CDN hostname** — `media.kamiyonstudio.com` / `media-staging.kamiyonstudio.com` (active)
- [x] **Hosted Studio hostname** — `kamiyon.sanity.studio` live; env bake-in fixed (ADR-009)
- [x] **Interim contact** — Google Form URL (wired in repo; QA-001 = Forms settings)
- [x] **Retire Google Form when T8 ships?** — **No.** Keep the Google Form as the chrome / “Get in touch” button CTA as-is (`INTERIM_CONTACT_FORM_URL` and seeded `ctaHref` stay). T8 Resend is an additional in-app path on `/contact` (or similar), not a replacement for that button. No WS5 cutover, dataset patch, or constant removal for the Form CTA.

---

## Recent polish (2026-07-26)

- **Adaptive nav contrast (ADR-015):** `useNavTheme` + `[data-nav-theme]` on homepage bands; transparent logo/button chrome; 3-line burger → X; menu open forces light ink; pink logo mark unchanged.
- **Multilayer parallax (ADR-014):** Osmo-style `ParallaxScrolling` UI on `/motion-lab` only — native scroll + GSAP scrub (no Lenis); local `/assets/*` layers; co-located CSS; Motion Lab footer/hero copy updated off Lenis.
- **Pink chrome glow CTAs (ADR-013):** `--border-default` → sakura tint; new `GlowingShadow` shell on primary `Button` only; kinetic nav toggle icon-only (frosted chrome removed in ADR-015).

## Recent polish (2026-07-24)

- **Partner logos (Sanity):** Home marquee renders uploaded `partner.logo` (R2) as images only — no links/CTAs. `websiteUrl` removed from partner schema. Studio: edit Partner docs → upload Logo → set Label/alt → uncheck Placeholder. Redeploy Studio after schema change (`pnpm sanity:deploy`).
- **Display headings:** CinematicFooter glow/size treatment (`footer-text-glow` + `text-5xl`/`md:text-8xl`/`font-black`) is now the default for `WordPullUp` section titles (home: Projects, Services, Contact).
- **Site cross-hatch:** Subtle fixed `.site-bg-grid` overlay (1% lines; footer keeps its own 3% masked grid).

## Architecture Decisions (active)

See [`DECISIONS.md`](./DECISIONS.md) for locked stack and cleanup ADRs (incl. ADR-010 QA / contact interim).
