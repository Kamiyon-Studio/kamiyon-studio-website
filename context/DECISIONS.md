# Architecture Decision Records (ADR)

> **Append-only.** Record locked decisions and major refactors here.  
> Operational build context: [`WEBSITE-ESSENTIAL-CONTEXT.md`](./WEBSITE-ESSENTIAL-CONTEXT.md).  
> Company facts: [`docs/`](../docs/).

---

## ADR-001 — Locked production stack (2026-07-21)

**Status:** Accepted

**Context:** Website build decisions consolidated in essential context §3.

**Decision:**

- CMS: **Sanity** (new project) + embedded Studio at `/studio`
- Hosting: **OpenNext** on Cloudflare Pages/Workers (free tier)
- Media: **Cloudflare R2** only; Sanity holds references
- Contact: form + external links via **Resend**
- Motion (main site): **GSAP + ScrollTrigger** only
- Motion Lab: public `/motion-lab`, **noindex**
- Fonts: **Geologica** (display/UI) + **Montserrat** (body)
- Brand colors: `#FF7998`, `#E9C080`, `#201013`, `#F8F8F8`
- Analytics: **Cloudflare Web Analytics** only
- Primary nav: Home, About, Services, Products, Portfolio, Community, Blog, Contact

**Consequences:** Payload, Vercel-as-default, Framer Motion, Lenis, Beaufort, and Poppins are not production targets.

---

## ADR-002 — Payload retirement; fallbacks-first interim (2026-07-21)

**Status:** Accepted

**Context:** Repo migrated Sanity → Payload (2026-07-11). Target reverted to Sanity. Full Sanity scaffold is Phase B; public site must stay up during cleanup.

**Decision:**

- Remove Payload runtime (config, collections, admin routes, deps)
- Keep `lib/cms` **public API shape** (`getHomePage`, etc.)
- Query functions return `null`; pages use `resolveWithFallback()` + typed fallbacks
- Keep `PortableText` renderer and domain types for Sanity swap
- Do **not** half-implement Sanity/R2/OpenNext/Resend in the cleanup PR

**Consequences:** No `/admin`; no Postgres CMS env. Editors use fallbacks until Sanity Phase B–C.

---

## ADR-003 — Preserve docs/ as company canon (2026-07-21)

**Status:** Accepted

**Decision:** Never delete or gut `docs/` for token savings. Website engineering SoT is `context/WEBSITE-ESSENTIAL-CONTEXT.md`; company facts remain in `docs/`.

**Consequences:** Older font/color lists in docs may differ from locked website tokens — essential context §8 wins for the site.

---

## ADR-004 — graphify-out is generated artifact (2026-07-21)

**Status:** Accepted

**Decision:** Remove `graphify-out/` from the repo; add to `.gitignore`. Regenerate locally with:

```bash
graphify update .
```

**Consequences:** Dependency graphs are on-demand, not committed.

---

## ADR-005 — Repo hygiene cleanup completed (2026-07-21)

**Status:** Accepted

**Decision:** Holistic cleanup applied: Payload removed, GSAP-only main site, Geologica/Montserrat + brand hex tokens, Products/Community in nav, agent docs aligned.

**Follow-ups (not in cleanup):** T1 Sanity scaffold, T3–T6 data layer + webhooks, T5 OpenNext deploy, T4 R2, T8 Resend contact form, T9 blog UI, T14 CF Analytics.

---

## ADR-006 — Phase C Sanity GROQ data layer (2026-07-23)

**Status:** Accepted

**Context:** Phase B delivered Studio + schemas. Public site still used null stubs + typed fallbacks.

**Decision:**

- Wire `lib/cms/queries.ts` to Sanity via GROQ (`lib/cms/groq.ts`) and `safeSanityFetch`
- Return `null` when Sanity is unset, empty, or errors — pages keep `resolveWithFallback`
- Resolve media with `getMediaUrl` / `r2Asset` (`url` or `key` + `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`)
- Expose blog getters (`getPosts`, `getPostBySlug`) ahead of blog UI (T9)
- Cache with `next.revalidate` + tags; webhook invalidation deferred to Phase E

**Consequences:** Empty dataset or missing env still serves fallbacks. Live content appears once Studio is configured and documents are published.

---

## ADR-007 — Hosted Sanity Studio (Workers Free size) (2026-07-24)

**Status:** Accepted

**Context:** OpenNext staging upload was ~5.5 MiB gzip because embedded `/studio` (`NextStudio` + `sanity`) landed in `handler.mjs`, exceeding Workers Free **3 MiB**. Workers Paid was declined for this phase.

**Decision:**

- Remove embedded Studio from the Next.js Worker; keep schemas + `sanity.config.ts` for CLI
- Host Studio via `pnpm sanity:deploy` at `https://{SANITY_STUDIO_HOSTNAME}.sanity.studio` (default `kamiyon`)
- Worker `/studio` **redirects** to hosted Studio (`NEXT_PUBLIC_SANITY_STUDIO_URL`)
- Studio media uploads call absolute `{SANITY_STUDIO_API_ORIGIN}/api/media/upload` with CORS allowlist for the Studio origin
- Marketing site remains on Cloudflare Workers Free; do not enable Workers Paid solely for Studio size

**Consequences:** Editors use `*.sanity.studio` (or `pnpm sanity:dev` locally). Sanity project CORS must allow the Studio host. Upload secret + API origin must be set for hosted Studio → R2. ADR-001 “embedded Studio at `/studio`” is superseded for deploy topology; `/studio` path retained as redirect.

**Ops note (2026-07-24):** Hostname `kamiyon` → https://kamiyon.sanity.studio/ redirects into Sanity Dashboard (`www.sanity.io/@…/studio/{appId}`). Keep `deployment.appId` in `sanity.cli.ts` in sync after `sanity deploy` / `sanity undeploy`. See ADR-009 for browser env bake-in.

---

## ADR-008 — Kinetic overlay nav replaces CardNav (2026-07-24)

**Status:** Accepted

**Context:** Production chrome used React Bits `CardNav`. Product direction requested a GSAP full-screen kinetic menu (sterling-gate) site-wide with Kamiyon branding.

**Decision:**

- Ship `SterlingGateKineticNavigation` in `components/ui/`; `SiteHeader` wraps it
- Use shell `navItems` / `contactCta` / `siteName` (full primary IA including Products + Community)
- Scoped CSS mapped to Kamiyon tokens — do not import demo indigo/purple globals
- Honor `prefers-reduced-motion`, Escape-to-close, `aria-expanded`

**Consequences:** CardNav remains in repo unused by the shell until cleaned up; header tests target the kinetic menu.

---

## ADR-009 — Hosted Studio env: static `SANITY_STUDIO_*` + repo defaults (2026-07-24)

**Status:** Accepted

**Context:** After ADR-007 hosting cutover, https://kamiyon.sanity.studio/ crashed with “Missing SANITY_STUDIO_PROJECT_ID…” even when `.env.local` had values and `sanity deploy` claimed vars were included. Root cause: Sanity’s Vite bundler only replaces **static** identifiers like `process.env.SANITY_STUDIO_PROJECT_ID`. A helper using `process.env[key]` was left empty in the browser bundle. A stale `deployment.appId` also produced post-login “Studio not found” until undeploy + fresh deploy.

**Decision:**

- In `sanity/env.ts`, read env only via static `process.env.SANITY_STUDIO_*` / `NEXT_PUBLIC_*` property access (never dynamic keys)
- Prefer `SANITY_STUDIO_*` for hosted Studio; fall back to `NEXT_PUBLIC_*` for Next.js
- Ship public repo defaults: project `c6ej1xoj`, dataset `kamiyon` (safe in client bundles)
- Document `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` in `.env.example`; set them before `pnpm sanity:deploy`
- Keep `deployment.appId` current in `sanity.cli.ts` after successful deploy (do not leave a stale id)

**Consequences:** Hosted Studio boots without requiring Next-only `NEXT_PUBLIC_*` in the Vite allowlist. Changing project/dataset still possible via env; defaults match the Kamiyon Sanity project. After deploy, hard-refresh Studio if an old `pane2-*.js` chunk is cached.

---

## ADR-010 — QA triage + interim Google Form contact (2026-07-24)

**Status:** Accepted

**Context:** Manual QA on pre-cutover production was consolidated in [`QA-Report.md`](./QA-Report.md). Kinetic nav (ADR-008) and hosted Studio (ADR-007) landed the same day. Several tracker constraints still said “no contact forms” / “embedded Studio.”

**Decision:**

- **Interim contact CTA:** external Google Form  
  `https://docs.google.com/forms/d/e/1FAIpQLSeIefAWJu5FP9pwljLFz1wSUxU2ybR3--GdylUYUBsGHH0yaw/viewform`  
  Wire as linked button until T8 Resend. `/contact` remains channels + mailto.
- **QA-001** (confirmation email): out of app scope — Google Forms respondent settings, not Resend.
- **QA-008** (CardNav hamburger freeze): superseded; do not patch CardNav for production shell.
- **Same-route in-app nav** (QA-005/006/007): smooth-scroll to top / target section.
- **Scroll tip** (QA-002/009): keep bounce UX; first scroll intent must move the page.
- **Execution:** QA polish (WS1–WS3) runs **in parallel** with staging ops (WS4a); Wave 4 DNS (WS4b) stays serial after WS4a.
- **T8 later:** Resend → studio inbox + visitor confirmation; confirm `CONTACT_TO_EMAIL` before prod.

**Consequences:** Context files updated (`progress-tracker`, `QA-Report`, essential §10, ai-workflow, project-overview). Repo must wire the Google Form URL (currently many CTAs still point at `/contact` only). Multitask fan-out ownership is defined in `progress-tracker.md`.

---

## ADR-011 — Sanity content seed from fallbacks (2026-07-24)

**Status:** Accepted

**Context:** Dataset was empty while the site rendered typed fallbacks. Editors needed base documents in Studio folders matching real field shapes (including placeholders).

**Decision:**

- Idempotent `pnpm sanity:seed` upserts from `lib/cms/fallbacks/*` plus partner slots and minimal blog stubs (`scripts/sanity/seed/`)
- Keep code fallbacks; do not remove them
- Stable IDs use hyphen form `{type}-{slug}` (dotted IDs are path-private without a read token)
- Preserve `isPlaceholder: true` where fallbacks mark placeholders; include sample portfolio case study
- Add `partner` document type; wire homepage marquee via `resolveWithFallback`
- Media left empty for Studio/R2 upload later
- `getCmsImageUrl` only returns `next/image`-allowlisted hosts (media CDN / local paths) so non-image URLs (e.g. itch.io pages) do not crash

**Consequences:** Dataset `kamiyon` seeded (42 docs, 2026-07-24). Requires `SANITY_API_WRITE_TOKEN` (Editor). Re-run safe via `createOrReplace`. See [`deploy-runbook.md`](./deploy-runbook.md) seed section.
