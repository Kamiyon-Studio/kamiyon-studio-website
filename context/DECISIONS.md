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

---

## ADR-012 — Cloudflare Web Analytics via manual beacon (2026-07-26)

**Status:** Accepted

**Context:** T14 required the only sanctioned analytics (essential context §3/§11 — Cloudflare Web Analytics, no GA4) without hurting the LCP/INP budget. Cloudflare offers automatic snippet injection for proxied zones, but the apex is not yet cut over (WS4b) and staging runs on `*.workers.dev`, which cannot be auto-injected. Only one beacon may render per page.

**Decision:**

- **Manual embed**, not Cloudflare automatic injection — one snippet per page, identical on staging and production, and versioned in the repo. Automatic injection must stay off in the dashboard.
- Load with `next/script` `strategy="afterInteractive"` from the root layout, so the beacon never blocks hydration or LCP.
- Emit `type="module"` — Cloudflare requires it on manual embeds so legacy browsers skip the beacon instead of throwing a syntax error (keeps the console clean).
- Split the decision from the rendering: pure `resolveCloudflareBeacon` in `lib/analytics/cloudflare-web-analytics.ts`; `components/analytics/CloudflareWebAnalytics.tsx` only renders. Keeps the unit tests browser-free and the modules small.
- **Fail closed and silent:** render `null` (no beacon, no console output) when the token is blank, or when `APP_ENV=local` / `NODE_ENV=development` — matching the dev check already used by `app/api/media/upload/route.ts`.
- Token comes from `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` only, read via **static** `process.env` access (ADR-009 precedent). Never hardcoded.
- Because public vars are inlined at build time, the token is supplied per environment at **build**: `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN_{STAGING,PRODUCTION}` GitHub Actions variables (already wired in `.github/workflows/deploy.yml`), or `.env.local` for local deploys. `wrangler.jsonc` carries an empty slot in both envs for parity/documentation, not as the enablement path.
- `spa: true` so App Router client navigations count as page views.
- **No CSP change:** the repo ships no `Content-Security-Policy` (no `headers()` in `next.config.ts`, no middleware; `public/_headers` sets cache headers only). Required directives are documented for whenever a CSP is introduced.

**Consequences:** Analytics is inert until an operator creates the Cloudflare sites and sets the build variables — see [`analytics-setup.md`](./analytics-setup.md) for the non-technical walkthrough. Rotating or changing a token requires a rebuild, not just a Worker var edit. Staging and production need separate site tokens (different apex domains).

---

## ADR-013 — Pink chrome glow CTAs + sakura borders (2026-07-26)

**Status:** Accepted

**Context:** Primary CTAs and default borders needed a cohesive sakura chrome treatment without violating AA text-on-accent (charcoal on `#FF7998`, not white-on-pink).

**Decision:**

- **`--border-default`** uses a subtle sakura tint (`rgba(255, 121, 152, 0.22)`) site-wide; `--color-border` continues to alias it.
- **Primary `Button` only** wraps its interactive control in `GlowingShadow` — a presentational shell with locked pink-red hue animation (~330°→380° / 50° rotate band). Secondary and ghost variants unchanged.
- **Kinetic nav toggle** is icon-only (two-bar hamburger → X via CSS); frosted chrome retained; no "Menu"/"Close" text labels.

**Consequences:** Glow is product-locked for primary CTAs. Do not extend to secondary/ghost or add full-spectrum hue spins without design review.

---

## ADR-014 — Multilayer parallax demo on Motion Lab (no Lenis) (2026-07-26)

**Status:** Accepted

**Context:** An Osmo-style multilayer parallax UI paste assumed in-component Lenis + GSAP installs. The site already has GSAP/`ScrollTrigger` and intentionally uses native scroll via `GsapScrollProvider` (ADR-001: Lenis is not a production target).

**Decision:**

- Ship `ParallaxScrolling` at `components/ui/parallax-scrolling.{tsx,css}` with co-located CSS (ScrollStack pattern).
- Wire animation through `useGsapContext` + `createScrollTriggerDefaults` + `gsap.matchMedia()` (`GSAP_ALLOW_MOTION` / `GSAP_REDUCE_MOTION`); skip scrub on coarse pointers (same as `useParallax`).
- **Do not** install or bootstrap Lenis inside the component; **do not** call `ScrollTrigger.getAll().forEach(st => st.kill())`.
- Mount **only** on `/motion-lab` — do not replace homepage `HeroOpening` parallax.
- Use local `/assets/*` images only (no Unsplash / Osmo CDN).

**Consequences:** Motion Lab is the sandbox for the Osmo multilayer demo. Production homepage keeps the lighter `useParallax` hook.

---

## ADR-015 — Adaptive nav contrast via section theme markers (2026-07-26)

**Status:** Accepted

**Context:** After ADR-013 frosted the logo chrome for dark-hero readability, the product direction shifted to transparent nav chrome with ink that adapts to the section behind the fixed header band.

**Decision:**

- **`useNavTheme`** (`hooks/useNavTheme.ts`) observes `[data-nav-theme]` bands with `IntersectionObserver` (`rootMargin: "-72px 0px 0px 0px"`); highest `intersectionRatio` wins; fallback `"light"`. Skip nodes inside `.sterling-gate` to avoid feedback.
- **Homepage markers:** outer `<section>` bands tagged `light|dark`; Services stack cards also carry `dark` when pinned.
- **Nav root** mirrors the winning band on `.sterling-gate[data-nav-theme]`; CSS flips `--sg-ink` to `--color-ivory` when `"dark"`. Pink `/logo.svg` mark is unchanged.
- **Menu open** forces `"light"` ink (overlay is light).
- **Chrome:** remove frosted pill from `.nav-logo-row` / `.nav-close-btn`; classic 3-line burger → X.

**Consequences:** Section authors must tag new homepage bands. Non-home routes default to light ink until markers are added. GSAP fullscreen menu timeline unchanged.

---

## ADR-016 — Five-service taxonomy & flat CMS shape (Gate 0) (2026-07-29)

**Status:** Accepted (Gate 0)

**Context:** Services IA was fragmented (10 placeholder services + 4 categories) and read as a generic software agency. Product brief (2026-07-29) locked five outcome-based offerings; parallel workstreams need a frozen taxonomy, remap matrix, redirects, and ownership before schema/seed/migration fan-out.

**Decision:**

- Exactly **five** top-level services, fixed order: Game Development (`game-development`) → Product Development (`product-development`) → UI & Design (`ui-design`) → Branding (`branding`) → Community & Events (`community-events`).
- Copy, taglines, descriptions, and capabilities are those in the product brief (recorded in [`gate0-services-taxonomy.md`](./gate0-services-taxonomy.md)).
- **Flat `service` documents** — deprecate/remove `serviceCategory` from public IA / seed / Studio emphasis; capabilities replace `outcomes`; add `tagline`.
- Remap + redirects for old slugs per Gate 0 matrix (merges into Product/Game; `ui-ux-design` → `ui-design`; delete `creative-services` / `blockchain-solutions` / `consultation` with index redirects).
- Removed standalone offerings: Creative Direction, Creative Services, UI/UX Design, Web/Mobile Development, AI Integration, Blockchain Solutions, Gamification, Consultation, Consulting & Technical Advisory, MVP as standalone, category labels as top-level services.
- Future AI/blockchain/DevOps/consulting = capabilities inside the five — never new top-level services.
- Preserve all case studies/clients; no service↔caseStudy refs exist today to reassign.
- CMS migration apply only after Gate 2 + human dry-run approval; WS-C dry-run only until then.

**Consequences:** WS-A/B/C may start in parallel (C dry-run only). WS-D–G wait for Gate 1. Integrator owns shared Gate 0/1/2 docs and wiring; exclusive paths in [`gate0-services-taxonomy.md`](./gate0-services-taxonomy.md) §6.

### ADR-016 addendum — Live remap extensions (Gate 1) (2026-07-29)

**Status:** Accepted (Gate 1)

**Context:** WS-C dry-run against dataset `kamiyon` found UUID-backed service/category docs outside the Gate 0 seed inventory. Human-approved; encoded in `scripts/sanity/migrate-services/matrix.ts` as `LIVE_SERVICE_REMAP_EXTENSIONS` / `LIVE_CATEGORY_SLUGS_TO_DELETE`.

**Decision:** Fold the following into the Gate 0 artifact (no invented targets beyond these):

| Old service slug | Action | New slug |
| --- | --- | --- |
| `community-growth-management` | merge | `community-events` |
| `creative-direction-branding` | merge | `branding` |
| `game-dev` | merge | `game-development` |

Extra category docs to delete (with Gate 0 ×4): `community-building`, `creative-direction`, `game-development` (category, not the service).

WS-G redirects for the three live service slugs: `/services/<old>` → corresponding five-service path.

**Consequences:** Migration matrix = Gate 0 + these extensions. Still **no** `--apply` until Gate 2 + human sign-off. Gate 1 unlocks WS-D ∥ WS-E ∥ WS-F ∥ WS-G.

---

## ADR-017 — Six-page IA + Sanity archive / portfolio rename (2026-07-29)

**Status:** Accepted

**Context:** Primary nav still advertised Products + Community while content was placeholder-only; taxonomy docs (`serviceCategory` / blog `category`/`tag`/`author`) duplicated constants; `caseStudy` naming mismatched the public `/portfolio` IA. Dataset remains seedable placeholder content.

**Decision:**

- Primary nav is **six pages**: Home, About, Services, Portfolio, Blog, Contact. **Get in touch** stays a separate CTA on the interim Google Form URL.
- `/products` and `/community` move under `app/(frontend)/_archive/` and **301 redirect to `/`**.
- Sanity types `product`, `communityItem`, `caseStudy`, `serviceCategory`, `category`, `tag`, `author`, `mediaAsset` stay registered as **readOnly** under a collapsed Studio **Archive** group — never delete documents.
- New active type **`portfolio`** (from caseStudy) with `serviceType` dropdown aligned to Gate 0 service slugs; home featured refs target `portfolio`.
- Blog `post.authors` → `teamMember`; categories/tags → string `options.list` from `lib/cms/taxonomies.ts`.
- Public CMS getters rename `getCaseStudies*` → `getPortfolioItems*` (documented break of the prior §7 API list).
- Re-seed (not migrate) for placeholder dataset; `teamMember.socialLinks` seeds as `[]`.

**Consequences:** Sitemap drops products/community; nav dropdowns derive from published services/portfolio; Gate 0 flat services remain the active service model (ADR-016).

---

## ADR-016 closeout — Gate 3 integration (2026-07-29)

**Status:** Accepted (Gate 3 PASS_WITH_NOTES)

**Context:** Workstreams A–H and Gates 0–2 complete. Integrator ran verify + e2e + focused code/security review before closing the five-service refactor. CMS migrate `--apply` was deliberately not run.

**Decision / findings:**

- **Verify:** Vitest **614/614** pass. `tsc --noEmit` still reports pre-existing errors in unrelated test fixtures (media/revalidate/TeamMember mocks, etc.) — not Gate 3 blockers.
- **E2E:** Playwright smoke **18/18** after fresh build. Critical paths covered: `/services`, five detail slugs, portfolio, `/services/ui-ux-design` → `ui-design`. Nav assertions updated so “Community & Events” is not confused with retired top-level `/community`.
- **Code review:** No CRITICAL. One HIGH fixed in-gate: `CANONICAL_SERVICE_SLUGS_GROQ` now derived from `SERVICE_CATEGORIES` (was a hardcoded fourth copy).
- **Security (migrate-services):** PASS — dry-run default; protected datasets (`kamiyon`/`production`/`prod`) require `--allow-prod`; write token required for apply; no secret logging.
- **Acceptance:** Exactly five services in app order game → product → ui-design → branding → community-events; removed offerings absent as standalone public offerings; redirects present; live CMS may still hold legacy docs until human `--apply`.

**Consequences:** App is Gate-3 green without dataset mutation. Next human step: non-prod dry-run sign-off then optional `--apply`. Production CMS mutation remains forbidden.

---

## ADR-018 — T8 Resend contact form on `/contact` (WS5) (2026-07-29)

**Status:** Accepted

**Context:** Plan locked 2026-07-26 for from/to addresses. Chrome “Get in touch” stays on the Google Form (ADR-010). Domain verification (DKIM/SPF/DMARC) is still operator work and independent of WS4b.

**Decision:**

- Add in-app form on `/contact` → `POST /api/contact` → **Resend** (studio inbox + visitor confirmation).
- From: `Kamiyon Studio <noreply@send.kamiyonstudio.com>` (`CONTACT_FROM_EMAIL`); to: `CONTACT_TO_EMAIL` defaulting to `PUBLIC_EMAIL` (`kamiyonstudio@gmail.com`).
- Studio mail `replyTo` = visitor; visitor confirmation `replyTo` = `PUBLIC_EMAIL`.
- Missing `RESEND_API_KEY` → API **503** (“not configured”); form still renders and surfaces the error. No hardcoded secrets.
- Honeypot (`company`) + in-memory IP rate limit (5 / 10 min per isolate).
- `INTERIM_CONTACT_FORM_URL` / chrome CTA **unchanged**.

**Consequences:** Form works locally/staging once `RESEND_API_KEY` + verified sending domain exist. Prod secrets after domain verify (+ preferably after WS4b). WS7 E2E expansion can cover the form next.

---

## ADR-019 — Contact header hardening + media upload MIME/size caps (2026-07-29)

**Status:** Accepted

**Context:** Security review (`context/security-review-contact-api-2026-07-29.md`) found one High (CRLF/header injection via contact `name` into email subject) and two Mediums on authenticated media upload (client MIME trust; no size cap before buffering). Plan: `.claude/plans/security-remediation-contact-media.plan.md`.

**Decision:**

### Contact (ship blocker)

- Reject C0 controls, DEL, and Unicode line/paragraph separators (`U+2028`/`U+2029`) in `name` and `email` at validation (`lib/contact/sanitize.ts` + `validate.ts`). Friendly 400 errors; zero Resend calls.
- Do **not** C0-filter `message` (newlines are legitimate body content).
- Defense-in-depth: `sanitizeHeaderValue` on studio `subject` and `replyTo` in `send.ts` even if send is called with unvalidated input.

### Media upload (follow-up, same remediation pass)

- Explicit allowlist: `image/png`, `image/jpeg`, `image/webp`, `image/gif`, `image/avif` (`lib/cms/media-upload-policy.ts`). Reject others with **415**.
- Cap uploads at **10 MiB** (`MAX_UPLOAD_BYTES`): reject oversized `Content-Length` with **413** before `formData()`; reject oversized `file.size` before `arrayBuffer()`.
- Auth remains first (**401** before 413/415). CORS preserved on error envelopes.

### Accepted Lows (revisit triggers)

| Tradeoff | Revisit when |
| --- | --- |
| Per-isolate in-memory rate limit (not shared across Workers) | Sustained spam across many isolates / need Durable Object or KV counter |
| No CAPTCHA (honeypot + rate limit only) | Measurable bot spam on `/api/contact` |
| `message` keeps newlines (body-only; not a header) | Provider treats body like headers (unlikely with Resend text) |
| Filename extension not forced to match MIME | Abuse of extension vs content-type on CDN; add magic-byte sniff if needed |

**Consequences:** Contact form is safe to ship from a header-injection standpoint once Vitest + staging gate pass. Media Studio uploads of SVG/HTML are blocked; oversize payloads fail early. Magic-byte sniff left optional (plan B5).

---

## ADR-020 — Interactive FAQ accordion replaces Skeleton Accordion on `/contact` (2026-07-29)

**Status:** Accepted (WS-A–E landed — FAQ verify gate PASS for FAQ scope; Skeleton Accordion retired; Wave 4 founder visual sign-off pending; SHAs soft until commit)

**Context:** Design request to replace the Skeleton-based FAQ accordion on `/contact` with a numbered, spring-animated interactive accordion (zero-padded numbers, spring height reveal, hover underline, `+` → `×` indicator). Plan: `.claude/plans/contact-faq-interactive-accordion.plan.md`. CMS FAQ content, `id="faq"`, and FAQPage JSON-LD stay unchanged.

**Decision:**

- Own client primitive `components/ui/InteractiveAccordion.tsx` (PascalCase; matches export name) on **`motion/react`** — existing `motion` dependency; **not** `framer-motion`.
- `ContactFAQ` maps `FaqItem[]` → `InteractiveAccordionItem[]` and consumes the new primitive; Skeleton `components/ui/Accordion.tsx` wrapper is **retired** after that migration (delete in WS-C, not a re-export shim).
- Single-open, collapsible, first item open by default (parity with current Accordion).

**Accepted tradeoffs:**

| Tradeoff | Rationale |
| --- | --- |
| Collapsed panel bodies unmount (content absent from DOM/AT when closed) | FAQ SEO rides on FAQPage JSON-LD in `contact/page.tsx`, which is untouched |
| Number + open/close indicator are decorative (`aria-hidden`) | Accessible name of each trigger is the question `title` only |
| No arrow-key roving tabindex | APG-optional; Tab / Enter / Space on native buttons is enough for v1 |

**Consequences:**

- Documented **exception** to `ui-context.md` “prefer Skeleton primitives wrapped in `components/ui/*`” — FAQ uses a custom motion primitive instead.
- `motion` is the **second** client animation engine alongside GSAP (already used via `text-roll` / `logo-carousel`; no new package).
- See `ui-context.md` Motion / FAQ row for the pattern pointer.

---

## ADR-021 — Home services vertical marquee replaces ScrollStack cards (2026-07-29)

**Status:** Accepted

**Context:** Design request to replace the homepage `ServicesStack` ScrollStack card carousel with a vertical text-marquee CTA. Each marquee row must be the navigational control to `/services/{slug}`. Plan: `.claude/plans/home-services-vertical-marquee.plan.md`. Gate 0 five-service taxonomy (ADR-016) and CMS fetch stay unchanged.

**Decision:**

- Client primitive `components/ui/cta-with-text-marquee.tsx` (`CTAWithVerticalMarquee` + `VerticalMarquee`) driven by CSS `@keyframes marquee-vertical` / `fade-in-up` in `app/globals.css`.
- `ServicesStack` maps `ServiceStackSlide[]` → `VerticalMarqueeItem[]` (`id` / `label` / `href`); left band keeps “What we build” + View all services / Get in touch.
- Loop duplicate track uses a non-interactive `clone` (spans) so Tab order has one link per service.
- `prefers-reduced-motion: reduce` → static vertical link list (no infinite animation).
- `ScrollStack` left in tree (optional hygiene); not required for ship.

**Accepted tradeoffs:**

| Tradeoff | Rationale |
| --- | --- |
| Per-service summary no longer shown on home cards | Detail lives on `/services/[slug]`; marquee is discovery, not synopsis |
| Center-fade opacity via rAF | Matches reference motion; cleaned up on unmount; disabled under reduced motion |
| No `min-h-screen` shell from the reference demo | Mid-page section must not dominate homepage scroll |

**Consequences:**

- Home services motion pattern documented in `ui-context.md`.
- Homepage `page.tsx` mapper (`toServiceStackSlides`) unchanged.
- See plan Wave 1–3 for multitask ownership.

---

## ADR-022 — Phase E closeout: OpenNext Workers + R2 + kinetic nav (2026-07-30)

**Status:** Accepted (code + staging/prod Workers live; apex DNS cutover still operator)

**Context:** Phase E (T4/T5/T6/T14) + Track G kinetic nav needed a single closeout record spanning OpenNext staging/prod, R2 media/cache, webhooks, analytics, and the site-wide header swap. Prior ADRs cover pieces: ADR-007/009 (hosted Studio), ADR-008 (kinetic nav), ADR-012 (Web Analytics beacon).

**Decision:**

- **Hosting:** `@opennextjs/cloudflare` on Workers Free — workers `kamiyon-studio-website-staging` / `kamiyon-studio-website`; branch map `staging`→staging, `main`→prod (CI: `.github/workflows/deploy.yml`).
- **R2:** Media buckets `kamiyon-media-{staging,prod}` + incremental cache `kamiyon-next-cache-{staging,prod}`; public CDN `media-staging` / `media.kamiyonstudio.com`. Upload via `POST /api/media/upload` (Bearer `MEDIA_UPLOAD_SECRET`) + Studio `r2Asset` input.
- **Revalidate:** `POST /api/revalidate` + `lib/cms/revalidate-tags.ts`; staging Sanity webhook live; production webhook waits for apex cutover.
- **Analytics:** Manual CF Web Analytics beacon (ADR-012); inert until build-time token set.
- **Chrome:** Kinetic overlay nav site-wide via `SiteHeader` → `SterlingGateKineticNavigation` (ADR-008); Kamiyon tokens only.
- **Env:** Prefer `APP_ENV` over `VERCEL_ENV`; `NEXT_PUBLIC_SITE_URL` / public vars inlined at **build** time.

**Consequences:**

- Tickets T4/T5/T6/T14 marked done in essential context (ops gaps called out below).
- **Remaining operator (WS4b):** attach `kamiyonstudio.com` + `www` to prod Worker; create prod revalidate webhook; bake Studio `SANITY_STUDIO_API_ORIGIN` for apex; set analytics build tokens; pause Vercel after 24–48 h green. See [`dns-cutover-guide.md`](./dns-cutover-guide.md) + [`deploy-runbook.md`](./deploy-runbook.md).
- Archive: [`completed/2026-07-30-phase-e-cloudflare-opennext.md`](./completed/2026-07-30-phase-e-cloudflare-opennext.md).

---

## ADR-023 — Combined home hero + partners opening stage (2026-07-30)

**Status:** Accepted (WS-A–D landed; WS-E docs)

**Context:** Homepage previously stacked a full-bleed hero then a separate light partners marquee section. Design intent is one opening composition: brand + motto above, partners logos as a lower band on the same dark full-bleed stage. CMS partners content unchanged.

**Decision:**

- Home opening is one full-bleed stage via `<Hero partners={…} />` — brand + motto upper; `PartnersMarquee layout="band" tone="onDark"` lower.
- `#home-partners` retained for scroll spy; `data-nav-theme="dark"` through the opening (not light).
- Standalone light partners section removed from `page.tsx`.
- Soft bottom scrim for logo legibility; no blend to `--bg-secondary`.
- Motto kept; no “Trusted by” eyebrow in the band; section-nav label still “Trusted by”.
- `PartnersMarquee` API: `layout?: "section" | "band"`; `tone?: "onLight" | "onDark"`.

**Accepted tradeoffs:**

| Tradeoff | Rationale |
| --- | --- |
| Partners share dark hero imagery instead of a light section | One first-viewport composition; `tone="onDark"` keeps logos readable |
| No in-band “Trusted by” eyebrow | Band stays quiet under brand/motto; label remains on section nav only |
| Dark nav theme through opening | Matches full-bleed stage; avoids premature light chrome over dark media |

**Consequences:**

- Home layout line in `ui-context.md` updated (combined opening → projects → …).
- CMS / partner document shape unchanged.

---

## ADR-024 — About values hover-expand strip replaces TiltedCard grid (2026-07-30)

**Status:** Accepted (WS-A + WS-B landed; WS-E verify PASS — vitest 9/9; TiltedCard retained for other consumers; Wave 4 founder visual sign-off pending)

**Context:** About `ValuesGrid` rendered CMS `CoreValue` items as a responsive `TiltedCard` marketing-card grid (✦ icon + name + description always visible). Operator wants a Skiper-style hover-expand image strip instead. The team section already uses `components/ui/expand-on-hover.tsx` (`HoverExpand`) for portraits, so values must not overwrite that primitive.

**Decision:**

- New client primitive `components/ui/values-expand-on-hover.tsx` (`ValuesHoverExpand`) — separate file from team `expand-on-hover.tsx`; do **not** overwrite or generalize the team strip.
- `ValuesGrid` becomes a thin mapper: CMS `CoreValue[]` → strip items; keep `#values` anchor and “What we value” heading.
- CMS `CoreValue` **name** + **description** remain on the **active** overlay only (collapsed columns show imagery, not full copy).
- Fixed Unsplash images per value (code constant / index map) — **no** CMS image field on `CoreValue`.
- Allow Unsplash host via `next.config` `images.remotePatterns` (WS-A ownership) so `next/image` can load fixed URLs.
- Use `motion/react` only (already in repo); **no** swiper / framer-motion installs.

**Accepted tradeoffs:**

| Tradeoff | Rationale |
| --- | --- |
| Separate values primitive vs shared expand-on-hover | Team strip is portrait/social-specific; values need image + name/description overlay without coupling APIs |
| Fixed Unsplash URLs, not CMS images | Avoid schema/migration; values copy stays editorial CMS; visuals are design-locked |
| Name/description only on active overlay | Matches Skiper expand pattern; reduces clutter vs always-visible card copy |

**Consequences:**

- New UI primitive under `components/ui/`; team `HoverExpand` / `TeamGrid` unchanged by this feature.
- `ValuesGrid` presentation-only change; CMS `CoreValue` type and About page fetch unchanged.
- `TiltedCard` **retained** — still consumed by FeaturedWork, Highlights, and marketing cards (WS-C skipped).
- About layout row in `ui-context.md` documents hover-expand values strip.
- Plan: `.claude/plans/values-expand-on-hover.plan.md` · tracker WS-A–E.
- Wave 3 closeout (2026-07-30): WS-A/B Done; WS-E vitest 9/9 PASS; founder visual ack still open.

---

## ADR-025 — About timeline entry types + cumulative roster aside (2026-07-30)

**Status:** Accepted (WS-A–G local PASS — vitest full suite green; founder visual sign-off pending)

**Context:** About `/about#timeline` used a single monolith (`components/ui/timeline.tsx`) with news-only milestones, a singular required image, and a static year rail with no active state or roster. Operator wants a Sabotage-Studio *layout language* (alternating cards, centre spine, bordered frames, sticky right panel with year rail + live roster) adapted to Kamiyon brand tokens — not a clone.

**Decision:**

- Frozen UI contract in `lib/timeline/**` (`TimelineEntryV2`, `buildCumulativeRoster`, `buildYearRail`) — framework-free so CMS, cards, and aside can share it without cycles.
- Two entry types: `news` | `teamJoin`. `teamJoin` **must** reference a Sanity `teamMember`; roster cells use that member’s photo + name (initials when photo missing).
- Cumulative roster is **reversible** by default (scroll-up removes later joins); `TeamGrid` remains the canonical always-complete team list. Roster starts empty.
- CMS: `images: r2Asset[]` (min 1); legacy singular `image` kept hidden/read-only with a mapper read path during migration. Embla only when `images.length > 1`.
- Motion split: GSAP keeps the spine `scaleY` scrub; year spy + roster use `IntersectionObserver` only. Aside pins with CSS `position: sticky` (never `fixed`).
- `prefers-reduced-motion: reduce` reveals the full roster and first year active with no scroll gating.

**Accepted tradeoffs:**

| Tradeoff | Rationale |
| --- | --- |
| Kamiyon tokens over Sabotage grayscale/crown overlays | Brand first; reference is IA/layout only |
| Reversible roster vs monotonic “history” | Panel reads as “the studio as of this point”; monotonic is a hook flag if needed later |
| Legacy `image` read path kept temporarily | Published docs stay valid mid-migration; hygiene removal deferred |
| Compact year chips below `xl`; roster omitted on small screens | Avoids cramming three zones; `TeamGrid` already carries the full team |

**Consequences:**

- New: `lib/timeline/**`, `timeline-entry-card` / `timeline-entry-media` / `timeline-aside`, `useTimelineScrollSpy`, `useCumulativeRoster`.
- `Timeline` becomes an orchestrator; `StoryTimeline` + About `toTimelineEntries` consume `TimelineEntryV2`.
- Sanity `storyTimelineEntry` gains `entryType`, `teamMember`, `images[]`; seed emits the new shape.
- Plan: `.claude/plans/about-timeline-sabotage-style.plan.md` · tracker WS-A–G.

---

## ADR-026 — Home partners continuous logo marquee (2026-07-30)

**Status:** Accepted (WS-A–D landed; local vitest green)

**Context:** Homepage partners band (`PartnersMarquee` under the combined hero opening, ADR-023) used Embla `AnimatedCarousel` with small full-color logos and stepped autoplay. Canon and operator intent call for a continuous horizontal strip, larger logos, and grayscale idle → full color on hover.

**Decision:**

- New client primitive `components/ui/logo-marquee.tsx` — CSS infinite horizontal marquee (`--animate-marquee-horizontal` / `@keyframes marquee-horizontal` translating `-50%` over a duplicated track).
- `PartnersMarquee` swaps Embla for `LogoMarquee`; section API (`layout`, `tone`, eyebrow, `#home-partners`) unchanged.
- Logo treatment: larger heights (later tuned to ~¾ of the first enlarge), `grayscale` + muted opacity at rest, full color/opacity on per-logo `group-hover/logo` / `group-focus-within/logo`.
- `prefers-reduced-motion: reduce` → static single row, no clone.
- CMS / `PARTNER_PLACEHOLDERS` / partner document shape unchanged. `logo-carousel.tsx` retained (not deleted in this ADR).

**Accepted tradeoffs:**

| Tradeoff | Rationale |
| --- | --- |
| CSS marquee vs Embla loop | Continuous motion matches “marquee” product language; avoids snap/basis layout fighting logo sizes |
| Grayscale idle (canon §2) | Trust strip stays quiet under brand; color on hover rewards attention |
| Keep `AnimatedCarousel` | Out of scope hygiene; partners no longer consumes it |

**Consequences:**

- Home partners line in `ui-context.md` notes continuous marquee + desaturate hover.
- Plan: `.claude/plans/home-partners-continuous-marquee.plan.md` · tracker WS-A–D.

---

## ADR-027 — About page drops Vision / Values / Culture sections (2026-07-30)

**Status:** Accepted

**Context:** `/about` stacked VisionBand → ValuesGrid (“What we value”) → TeamGrid → CultureClosing (“Our culture”) after the timeline. Operator wants a tighter About story: hero → story → timeline → team only.

**Decision:**

- Remove `VisionBand`, `ValuesGrid`, and `CultureClosing` from `app/(frontend)/about/page.tsx`.
- Archive section sources + the values-only `values-expand-on-hover` primitive under `archive/about-vision-values-culture/` (not deleted).
- Keep Sanity `vision` / `values` / `cultureSummary` fields, GROQ, mappers, fallbacks, and seed so CMS content remains recoverable.
- Update e2e About smoke to assert `#team` without `#values`.

**Accepted tradeoffs:**

| Tradeoff | Rationale |
| --- | --- |
| Archive code vs delete | Easy restore; history preserved |
| Leave CMS fields unused | Avoid schema/content migration churn; Studio can still edit dormant copy |

**Consequences:**

- About layout line in `ui-context.md` updated.
- ADR-024 remains historical for the archived values strip.
- Archive README: `archive/about-vision-values-culture/README.md`.

---

## ADR-028 — About team FocusRail replaces InteractiveSelector (2026-07-30)

**Status:** Accepted

**Context:** `/about#team` used an accordion-style `InteractiveSelector` portrait strip. Operator wants a 3D focus-rail carousel (drag / wheel / keyboard / prev-next) for browsing members.

**Decision:**
- Add `components/ui/focus-rail.tsx` (Motion `motion/react`, lucide chevrons, optional Explore `Link`).
- Rail chrome is **minimized** (title + role only). Description / Explore live in a **click-to-open card modal**.
- `TeamGrid` maps `TeamMember[]` → `FocusRailItem[]` (title=name, meta=role, description=useful bio, image=CMS photo or Unsplash atmosphere placeholder — not fake portraits).
- Keep `#team` anchor; no team intro body copy on the page. Rail is full-bleed under the single-line WordPullUp heading.
- About important section titles (Our Story, Timeline, Meet the team) use **WordPullUp** / `DISPLAY_HEADING_CLASS` (same as Home “Recent Projects”).
- Dependencies already in-repo: `next`, `lucide-react`, `motion` (import from `motion/react`, not `framer-motion`).

**Consequences:**
- Team section is a dark theatrical band inside the light About page — intentional contrast.
- `InteractiveSelector` / `expand-on-hover` remain in the codebase for other use but are no longer the About team surface.
- Explore CTA appears only in the modal when a member has a social URL.

---

## ADR-029 — Home hero layered parallax on R2 plates, original hero as fallback (2026-07-30)

**Status:** Accepted

**Context:** The combined home opening (ADR-023) used one static plate (`/assets/background.jpg`) with a single-layer `useParallax` drift. Operator supplied four hand-painted depth plates (sunset range → lit ridge + lake → pagoda hillside → foreground rocks) and asked for a multi-plate parallax, with the plates hosted on R2 rather than committed to the repo, and the existing hero kept as the fallback.

**Decision:**

- Plates live **only** in R2 under the versioned prefix `site/hero/parallax/v1/layer-{1..4}.webp`; unprocessed originals are archived beside them under `sources/`. Nothing is committed to `public/`.
- `pnpm media:hero-parallax` (`scripts/media/hero-parallax/**`) is the one-way build+publish pipeline: `sharp` keys the black voids to alpha, resizes, encodes WebP, then `wrangler r2 object put` uploads to `kamiyon-media-{staging,prod}`. Dry-run by default; `--apply` writes.
- Alpha comes from **preprocessing, not CSS** — the source plates are JPEG composites over black. A 1-pass 3×3 erosion of the coverage map plus a `smoothstep(8, 28)` luminance ramp removes the premultiplied dark fringe on ridge edges.
- `Hero` is a server component that calls `resolveHeroParallaxLayers()`: it returns `null` when `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` is unset or not an allowed `next/image` host, and `Hero` then renders the original `HeroOpening`. No client-side error handling or feature flag.
- Brand + motto extracted to `HeroBrand` so both hero variants share one wordmark, and the brand occupies the depth-3 parallax slot (plates 1–2 behind it, plate 4 in front).
- Motion generalized into `hooks/useLayeredParallax`, gated on `GSAP_ALLOW_MOTION and (pointer: fine)` — touch and reduced-motion users get the static composition.

**Accepted tradeoffs:**

| Tradeoff | Rationale |
| --- | --- |
| Hero art is an env-dependent runtime asset, not a repo asset | Keeps four ~1 MB plates out of git; R2 + CDN already serve all other media |
| Alpha baked at build time vs `mix-blend-mode` / `mask-image` | Blend modes wash out the sunset plate and mask support is uneven; preprocessing is deterministic and cheap to serve |
| Versioned key prefix instead of content hashes | Plates change rarely; bumping `v1` → `v2` is an explicit, reviewable cache bust |
| Parallax skipped on coarse pointers | Four full-bleed plates scrubbing on mobile is a battery/jank cost for little payoff |
| Radial brand scrim + strengthened bottom scrim | Wordmark and partner logos need contrast against a light-topped sunset plate |

**Consequences:**

- New: `lib/home/hero-parallax-layers.ts`, `components/sections/HeroParallaxOpening.tsx`, `components/sections/HeroBrand.tsx`, `hooks/useLayeredParallax.ts`, `scripts/media/hero-parallax/**`; `sharp` added as a dev dependency.
- `HeroOpening` keeps its single-plate `useParallax` path and is now brand-free (delegates to `HeroBrand`).
- Republishing plates is an operator step, not part of `deploy.yml` — see `.env.example` for the gating variable.
- Home layout + motion rows in `ui-context.md` updated.

---

