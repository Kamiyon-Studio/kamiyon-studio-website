# Kamiyon Studio Website — Essential Build Context

> **Status:** Decisions locked (2026-07-21). This is the single source of truth for building the production website.  
> **Canon (company facts):** [`docs/`](../docs/) — load only when copy/facts are needed.  
> **Historical / superseded:** Payload migration, old Sanity plan, and phase archives live under [`context/completed/`](./completed/). Do not follow them for new work.

---

## 1. Purpose of this document

This file consolidates everything required to design, implement, review, and ship the **Kamiyon Studio official marketing / portfolio website**.

It intentionally **excludes** company-wide material that is not needed to build the site (full blockchain strategy, org charts, social calendars, product design deep-dives for games, etc.). For those, see `docs/` only when a page needs specific facts.

**When conflicts arise:**

1. This file (website build decisions) wins for stack, CMS, hosting, performance, motion, and implementation scope.
2. `docs/` wins for company facts, brand language, and what may be claimed publicly.
3. Never invent clients, awards, metrics, or events not present in canon or CMS.

---

## 2. Product definition

| Item | Decision |
| --- | --- |
| Product | Production-grade marketing portfolio + CMS-backed content site |
| Audience | Global (clients, partners, educators, players, media, future hires) |
| Primary job | Trust + clarity + qualified contact / consultation interest |
| Editors | Non-developers via **hosted** Sanity Studio (`kamiyon.sanity.studio`); Worker `/studio` redirects (ADR-007) |
| Motto (site) | **Create. Play. Inspire.** (canon; ignore README “Play. Question. Create.”) |
| HQ (display) | Biñan City, Laguna, Philippines · Founded 2024 |
| Production URL | `https://kamiyonstudio.com` |
| Preview / staging | Cloudflare Workers `*.workers.dev` (staging live); Pages `*.pages.dev` only if used |

### Goals

1. Communicate who Kamiyon is within the first viewport.
2. Showcase services, products, portfolio, community, and blog as production surfaces.
3. Let non-dev editors publish text, structured content, and media safely — **without a new deployment** (ISR + webhook revalidation).
4. Hit strict performance / a11y / SEO budgets (see §9).
5. Keep motion tasteful and GSAP-only on the main site; Motion Lab remains a public noindex showcase.

### Out of scope (unless explicitly reopened)

- Auth for public visitors (except Sanity Studio login for editors)
- Client portals / dashboards
- Payload CMS / Postgres CMS runtime
- Shipping Motion Lab patterns site-wide as default UX
- Fabricating case studies, testimonials, or community events
- GA4 or non-Cloudflare analytics
- Beaufort / Poppins as production fonts

---

## 3. Locked decisions (2026-07-21)

| Topic | Decision |
| --- | --- |
| Hosting | **OpenNext** on Cloudflare Pages + Workers (SSR/ISR) |
| Caching | Sanity content fetched dynamically with **cache + `revalidateTag` / webhook** so publish ≠ redeploy |
| Domain | Production `https://kamiyonstudio.com`; staging `*.workers.dev` |
| Cloudflare plan | **Free tier** (Pages + Workers + R2 within free limits; upgrade only if exceeded) |
| CMS | **New** Sanity project + dataset (`npm create sanity@latest`) |
| Studio | **Hosted** at `https://kamiyon.sanity.studio` (ADR-007); `/studio` on Worker redirects |
| Media | **All** images, videos, downloadables in **Cloudflare R2**; Sanity stores structured content + **media references** (URLs/keys) only |
| Seed | `pnpm sanity:seed` from `lib/cms/fallbacks` (+ partners/blog stubs); Studio for R2 media refine (ADR-011) |
| Contact | **Chrome CTA:** Google Form (retained); **`/contact`:** in-app form via **Resend** (T8/ADR-018; env-gated) + external channels |
| Blog | Authors, categories, tags, featured image, SEO, Portable Text, reading time, published/updated dates, related posts |
| Primary nav | Home, About, Services, Portfolio, Blog, Contact (+ separate “Get in touch” CTA) |
| Motion (main site) | **GSAP only** (remove Framer Motion + Lenis from production routes) |
| Motion Lab | Keep `/motion-lab` in production; **`noindex`**; public animation showcase |
| Brand colors | Primary `#FF7998` · Secondary `#E9C080` · Black `#201013` · White `#F8F8F8` |
| Fonts | **Geologica** (display/UI) · **Montserrat** (body/supporting) via Google Fonts / `next/font` |
| Decorative font | **Remove Beaufort** |
| Analytics | **Cloudflare Web Analytics only** |

---

## 4. Target stack (locked)

```
Editors ──► kamiyon.sanity.studio ──► Sanity Content Lake (structured data + R2 refs)
              ▲ Worker /studio redirects here
                                         │
                                         │ webhook → revalidateTag / ISR
                                         ▼
Visitors ──► Cloudflare CDN ──► OpenNext (Pages/Workers) ──► Sanity API (cached)
                                         │
                                         ▼
                                   Cloudflare R2 ──► media (CDN)
                                         │
Contact (interim) ──► Google Form (external)
Contact (T8) ──► API route / Worker ──► Resend ──► studio inbox + visitor confirm
```

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript + React | Site, SSR/ISR, metadata |
| Adapter | **OpenNext for Cloudflare** | Run Next on Pages/Workers |
| UI | Tailwind CSS 4 + design tokens | Presentation |
| CMS | **Sanity** | Structured content; Studio hosted (ADR-007) |
| Media | **Cloudflare R2** + CDN | All binaries; Sanity holds references only |
| Edge / hosting | Cloudflare Pages + Workers (free tier) | Host + cache |
| Email | **Resend** (T8); interim Google Form | Contact delivery |
| Analytics | **Cloudflare Web Analytics** | Privacy-friendly traffic |
| SEO | `lib/seo/*` + Sanity SEO fields | Metadata, JSON-LD, sitemap, robots |
| Motion | **GSAP + ScrollTrigger** only (main site) | Tasteful animation |
| Tests | Vitest + Playwright | Unit/component + critical E2E |
| Tooling | ESLint, Knip, TypeScript strict | Quality gates |

### Explicitly retiring from the runtime

| Current (Payload era) | Target |
| --- | --- |
| Payload CMS 3 + Postgres | Sanity Content Lake |
| `@payloadcms/*`, `payload.config.ts`, `collections/`, `globals/`, `app/(payload)/` | Remove after Sanity swap |
| Local `/api/media` Payload uploads | R2 only |
| Vercel as assumed host | Cloudflare OpenNext |
| Lexical → Portable Text adapter | Native Portable Text from Sanity |
| Framer Motion, Lenis (main site) | Remove from production routes |
| Poppins, Beaufort | Geologica + Montserrat |

**Keep:** `app/(frontend)/` routes, `components/` (adapt fonts/colors), `lib/cms` **public API shape**, typed fallbacks, SEO helpers, most section/UI components.

---

## 5. Sanity + R2 — how it works with the current repo

### Current repo reality (2026-07-21)

Payload **removed**. Public site uses Sanity GROQ via `lib/cms` when configured; otherwise **typed fallbacks** via `resolveWithFallback()`. Studio at `/studio` (env-gated).

### Migration shape (do not keep both)

1. Scaffold **new** Sanity project; embed Studio at `/studio`.
2. Recreate schemas (§7); seed via `pnpm sanity:seed` (ADR-011); refine media in Studio.
3. Swap `lib/cms` to `next-sanity` + GROQ; preserve export names.
4. Media helper resolves **R2 URLs** from Sanity reference fields (never Sanity asset CDN as source of truth).
5. Delete Payload tree, deps, Postgres env, Lexical adapters.
6. Wire OpenNext, R2, Sanity webhooks → `revalidateTag`, Resend contact API.

### Media model

| In Sanity | In R2 |
| --- | --- |
| Title, slugs, Portable Text, SEO, refs, relationships | Image/video/file bytes |
| Fields like `r2Key`, `url`, `alt`, `mimeType`, `width`, `height` | Object storage under CDN domain |

Studio UX: custom R2 upload input (or signed upload API) so non-dev editors never leave Studio. No Sanity-hosted binary assets as primary storage.

### Free-tier watchouts

Stay within Cloudflare free limits for Workers requests, R2 storage/ops, and Pages builds. Prefer ISR + tag revalidation over full rebuilds; avoid huge prerender caches that stress R2 populate on deploy.

---

## 6. Caching & revalidation (publish without deploy)

**Requirement:** Editors publish in Sanity → site updates without a new Cloudflare deployment.

| Mechanism | Use |
| --- | --- |
| Next.js `fetch` cache / `unstable_cache` + tags | Cache Sanity GROQ results |
| Sanity webhook → `/api/revalidate` | Call `revalidateTag(...)` / `revalidatePath(...)` on publish |
| CDN | Cache HTML/assets at edge; respect revalidation |
| Draft / preview (optional later) | Sanity Presentation + draft mode if needed; not blocking launch |

```
Publish in Studio → Sanity webhook → Worker/API verifies secret
  → revalidateTag('home' | 'post:{slug}' | …)
  → next request hits Sanity (or warm cache) → fresh HTML
```

Do **not** rely on “redeploy on every content change.”

---

## 7. Information architecture & content model

### Public routes

| Route | Purpose | Indexing |
| --- | --- | --- |
| `/` | Home | index |
| `/about` | Story, timeline, team | index |
| `/services` · `/services/[slug]` | Five Gate 0 services | index |
| `/portfolio` · `/portfolio/[slug]` | Portfolio / client work | index |
| `/blog` · `/blog/[slug]` | Blog | index |
| `/contact` | Channels + interim form CTA | index |
| `/studio` | Sanity Studio (editors) | **noindex** |
| `/motion-lab` | Animation experiments showcase | **noindex** |
| `/products` · `/community` | **Archived** — permanent redirect → `/` | n/a |

### Primary navigation (locked 2026-07-29)

1. Home  
2. About  
3. Services (dropdown from published services)  
4. Portfolio (dropdown from published portfolio items)  
5. Blog  
6. Contact  

Separate chrome CTA: **Get in touch** → interim Google Form URL (unchanged).

### Sanity document map

| Type | Kind | Notes |
| --- | --- | --- |
| `siteSettings` | Singleton | Name, tagline, socials, default SEO, footer |
| `homePage` | Singleton | Hero, mission, featured work, highlights, CTA |
| `aboutPage` | Singleton | Story, values, culture |
| `contactPage` | Singleton | Intro, channels, FAQ, form settings copy |
| `teamMember` | Document | Order, role, R2 photo, `socialLinks[]`, `isPlaceholder` |
| `service` | Document | Flat Gate 0 five; `tagline` + `capabilities` (no category) |
| `portfolio` | Document | Challenge / solution / impact, `serviceType`, gallery, featured |
| `partner` | Document | Home marquee |
| `post` | Document | Authors → `teamMember`; categories/tags as string taxonomies |
| `r2Asset` (or object) | Object/doc | `url` / `key`, alt — **no binary in Sanity** |
| Shared | Objects | `seoMetadata`, `cta`, `socialLink`, portable text |
| **Archive (readOnly)** | Documents | `product`, `communityItem`, `caseStudy`, `serviceCategory`, `category`, `tag`, `author`, `mediaAsset` — kept registered; never delete existing docs |

### Blog `post` fields (required)

| Field | Notes |
| --- | --- |
| Title, slug | Required |
| Authors | Refs → `teamMember` |
| Categories | String array (`options.list` from `POST_CATEGORIES`) |
| Tags | String array (`options.list` from `POST_TAGS`) |
| Featured image | R2 media reference |
| Body | Portable Text (expand subset for blog: links, lists as needed) |
| SEO | `seoMetadata` object |
| Reading time | Computed on publish or stored minutes |
| Published date | Required for public posts |
| Updated date | Optional; show when set |
| Related posts | Refs → `post` |

### Portable Text

- Marketing pages: keep minimal (`normal`, `h2`, `h3`, `strong`, `em`).
- Blog: allow links, bullet/numbered lists, and block images via R2 refs as needed — document the subset in Studio.

### Stable `lib/cms` public API

Preserve: `getSiteSettings`, `getHomePage`, `getAboutPage`, `getContactPage`, `getTeamMembers`, `getServices`, `getServiceBySlug`, `getPortfolioItems`, `getPortfolioItemBySlug`, blog getters (`getPosts`, `getPostBySlug`, …), `resolveWithFallback`, `getMediaUrl` (R2).

Archived / legacy (still exported for archive routes or transitional callers): `getProducts`, `getProductBySlug`, `getCommunityItems`. (`getServiceCategories` removed — flat five services, ADR-016.)

Taxonomy constants: `SERVICE_CATEGORIES` / `POST_CATEGORIES` / `POST_TAGS` in `lib/cms/taxonomies.ts` (Studio `options.list` + title lookup).

---

## 8. Brand & UI essentials (website only)

### Personality & tone

Professional · Playful · Educational. Clear, helpful, confident, honest. No exaggerated claims.

### Official brand colors (locked)

| Role | Token | Hex | Usage |
| --- | --- | --- | --- |
| Primary | `--color-primary` / `--color-sakura` | `#FF7998` | Brand, CTAs, accents, fills |
| Secondary | `--color-secondary` / `--color-gold` | `#E9C080` | Sparse premium accents |
| Black | `--color-black` / `--color-charcoal` | `#201013` | Text, chrome |
| White | `--color-white` / `--color-ivory` | `#F8F8F8` | Page background |

**Accessibility utility (not a brand color):** derive `--color-primary-ink` (darkened primary) for text/icons on light backgrounds — raw `#FF7998` fails WCAG AA as text on white (~2.6:1). Pair primary **fills** with `--text-on-accent` → `#201013`.

**Deep Indigo:** not part of the locked 4-color website palette — do not invent or require it for launch.

Semantic tokens map to the four colors (`--bg-base` → white, `--text-primary` → black, `--accent-primary` → primary, `--accent-premium` → secondary).

### Typography (locked)

| Role | Font | CSS variable | Load |
| --- | --- | --- | --- |
| Display / UI (primary) | **Geologica** | `--font-display` / `--font-sans` | `next/font/google`, `display: swap` |
| Body / supporting (secondary) | **Montserrat** | `--font-body` | `next/font/google`, `display: swap` |

| Element | Font | Weight guidance |
| --- | --- | --- |
| Page title (h1) | Geologica | 600–700 |
| Section title (h2) | Geologica | 600–700 |
| UI / nav / buttons | Geologica | 500–600 |
| Body | Montserrat | 400 |
| Small / caption | Montserrat | 400, muted |

**Removed:** Beaufort, Poppins (as production fonts).

### Layout

- Warm light marketing site — not a dark dashboard.
- Rounded, friendly radii; follow `components/sections` + `components/ui`.
- Existing composition patterns remain; tokens/fonts update to match this section.

### Mascot

Kami-chan sparingly; never hurt LCP or clutter primary CTAs.

---

## 9. Motion policy

| Surface | Policy |
| --- | --- |
| Main site | **GSAP + ScrollTrigger only**; tasteful, purposeful (≈2–3 intentional moments per key page) |
| `/motion-lab` | Public showcase; may use experimental patterns; **`noindex`**; isolated from SEO |
| Framer Motion | Remove from production main-site routes |
| Lenis | Remove; use native scroll + GSAP |
| Reduced motion | Always honor `prefers-reduced-motion` |

Code-split GSAP; do not load it on pages with no animation.

---

## 10. Contact & email

| Channel | Behavior |
| --- | --- |
| Chrome primary CTA | External [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSeIefAWJu5FP9pwljLFz1wSUxU2ybR3--GdylUYUBsGHH0yaw/viewform) — **retained** after T8 |
| `/contact` page | In-app Resend form + channels + mailto (`kamiyonstudio@gmail.com`) |
| T8 pipeline | Form → `POST /api/contact` → **Resend** → studio inbox + visitor confirmation (ADR-018) |
| External links | Facebook, LinkedIn, public email (`mailto`), others from `siteSettings` |
| Secrets | `RESEND_API_KEY` Worker secret; `CONTACT_FROM_EMAIL` / `CONTACT_TO_EMAIL` vars; never commit |
| Validation (T8) | Server-side validate + honeypot + rate limit; no PII in client logs |
| Same-route nav | In-app links: smooth-scroll to top / section (QA policy A, 2026-07-24) |

---

## 11. Performance, a11y, SEO budgets

| Metric | Target |
| --- | --- |
| Lighthouse Performance | **≥ 95** |
| Lighthouse Accessibility | **100** |
| Lighthouse SEO | **100** |
| LCP | **< 2.5 s** |
| INP | **< 200 ms** |
| CLS | **< 0.1** |
| Approach | **Mobile-first** |

### Rules

- R2 images: correct sizes, modern formats, `priority` only on LCP candidates.
- Font subset: only needed Geologica / Montserrat weights.
- Server Components by default; client JS only when required.
- ISR + tag revalidation; Sanity fetch caching.
- `/studio` and `/motion-lab` → `noindex, nofollow` (or equivalent).
- Cloudflare Web Analytics snippet only — no GA4.

### Quality scorecard (phase gates)

| Area | Score (0–5) | Gate notes |
| --- | --- | --- |
| Architecture clarity | | No Payload leftovers; OpenNext + Sanity + R2 |
| Content editor UX | | Publish updates site without deploy |
| Performance (CWV) | | Mobile field + Lighthouse |
| Accessibility | | Contrast on `#FF7998`, keyboard, reduced motion |
| SEO | | Metadata, sitemap, JSON-LD; lab/studio noindex |
| Design system fidelity | | 4 brand colors + Geologica/Montserrat |
| Motion restraint | | GSAP-only main site |
| Test coverage | | Unit + E2E (incl. contact form) |
| Security | | Studio auth; Resend/R2/Sanity secrets; form rate limit |

---

## 12. Editor experience

- Clear Studio desk: Settings, Pages, Collections, Blog, Media refs.
- R2 upload from Studio (signed URL flow).
- Draft vs publish; `isPlaceholder` where useful.
- Blog authoring with full field set (§7).
- Publish triggers webhook revalidation — editors should not need eng for content updates.
- No Git / Postgres / Payload Admin for editors.

---

## 13. Architecture roadmap

### Phase A — Freeze (done)

Decisions in §3 locked.

### Phase B — Sanity scaffold

- Create new Sanity project/dataset; embed `/studio`.
- Schemas per §7; empty dataset.
- Keep Payload until Phase D.

### Phase C — Data layer swap (done 2026-07-23)

- `lib/cms` → Sanity + GROQ; R2 media URLs; fallbacks green.
- Tests/mocks updated.

### Phase D — Remove Payload

- Delete Payload deps/routes/schema; unwire `withPayload`.
- Env docs: Sanity + R2 + Resend + site URL.

### Phase E — Cloudflare OpenNext + R2 + webhooks — **done in-repo** (2026-07-30)

- OpenNext on Workers Free (staging + prod `*.workers.dev`); hosted Studio (ADR-007).
- R2 media + cache buckets; CDN domains Active; Studio upload API.
- Sanity webhook → revalidate (staging live; prod webhook after apex cutover).
- Cloudflare Web Analytics beacon (ADR-012; token build var still operator).
- Kinetic overlay nav site-wide (ADR-008). Closeout: ADR-022 + [`completed/2026-07-30-phase-e-cloudflare-opennext.md`](./completed/2026-07-30-phase-e-cloudflare-opennext.md).
- **Remaining:** WS4b apex DNS → Worker (operator) — see [`dns-cutover-guide.md`](./dns-cutover-guide.md).

### Phase F — Production surfaces

- ~~Nav: Products + Community~~ done (cleanup).
- ~~Fonts / brand hex / Framer+Lenis removal~~ done (cleanup).
- ~~T14 CF Web Analytics snippet~~ done in-repo (token ops pending).
- Blog frontend (T9).
- Contact form + Resend live path (T8 in-repo; domain verify + Worker secrets still ops).
- Lighthouse/CWV gates; E2E (T15); scorecard → launch.
- QA polish streams: see [`progress-tracker.md`](./progress-tracker.md) + [`QA-Report.md`](./QA-Report.md).

---

## 14. Refactor tickets

| ID | Ticket | Priority |
| --- | --- | --- |
| T1 | Scaffold Sanity project; Studio hosted (ADR-007) — `/studio` redirects | P0 — **done** (hosted 2026-07-24) |
| T2 | Schema parity (§7) including blog/author/category/tag | P0 |
| T3 | Swap `lib/cms` to Sanity + GROQ; keep public API + fallbacks | P0 — **done** (2026-07-23) |
| T4 | R2 media model + Studio upload + `getMediaUrl` | P0 — **done** (2026-07-30) |
| T5 | OpenNext Cloudflare deploy + env docs (free tier) | P0 — **done** (Workers Free; ADR-022) |
| T6 | Sanity webhook → `revalidateTag` / path revalidation | P0 — **done** (staging live; prod after WS4b) |
| T7 | Delete Payload runtime and deps | P0 — **done** (2026-07-21 cleanup) |
| T8 | Contact form API + Resend + external links UI (interim: Google Form CTA) | P1 |
| T9 | Blog listing/detail UI (reading time, related, SEO) | P1 |
| T10 | Remove Framer Motion + Lenis from main site | P1 — **done** (2026-07-21 cleanup) |
| T11 | Apply Geologica + Montserrat; remove Beaufort/Poppins | P1 — **done** (2026-07-21 cleanup) |
| T12 | Apply locked brand hex tokens (`#FF7998`, etc.) | P1 — **done** (2026-07-21 cleanup) |
| T13 | `/motion-lab` + `/studio` `noindex` | P1 — motion-lab done; studio verify at deploy |
| T14 | Cloudflare Web Analytics snippet | P1 — **done** (beacon; build token operator) |
| T15 | Expand E2E (nav, blog, contact form) | P2 |
| T16 | Primary nav: include Products + Community; update tests | P1 — **done** (2026-07-21 cleanup) |
| T17 | Editor Studio training / desk polish | P2 |
| T18 | Free-tier usage monitoring (Workers/R2/builds) | P2 |

---

## 15. What agents should load vs ignore

### Load for website work

1. **This file** — `context/WEBSITE-ESSENTIAL-CONTEXT.md`
2. [`docs/marketing/website-guidelines.md`](../docs/marketing/website-guidelines.md)
3. [`context/ui-context.md`](./ui-context.md) — must match §8 (colors/fonts locked here win)
4. [`context/code-standards.md`](./code-standards.md) — adapt CMS env to Sanity/R2/Resend
5. Tone/messaging docs when writing copy
6. Product/service docs only when editing that content

### Stale until rewritten

- [`context/architecture.md`](./architecture.md) — still Payload-era
- [`context/completed/**`](./completed/) — archives only
- ADR-001 “embedded Studio” / `*.pages.dev` preview wording — superseded by ADR-007 + live Workers staging; prefer §2–3 updates above + `progress-tracker.md` for ops status

### Company AI context

[`docs/ai/ai-context.md`](../docs/ai/ai-context.md) for brand voice only — not engineering plan. Prefer §8 colors/fonts over older visual-identity font lists when they conflict.

---

## 16. Environment variables (target)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://kamiyonstudio.com` (preview overrides OK) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset name |
| `SANITY_API_READ_TOKEN` | Server read (if private dataset) |
| `SANITY_REVALIDATE_SECRET` | Webhook auth |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` | Uploads + signed URLs |
| `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` | CDN/public media base |
| `RESEND_API_KEY` | Contact form (Worker **secret**) |
| `CONTACT_TO_EMAIL` | Inbox recipient (default `kamiyonstudio@gmail.com`) |
| `CONTACT_FROM_EMAIL` | Verified Resend from (`Kamiyon Studio <noreply@send.kamiyonstudio.com>`) |
| `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` | Cloudflare Web Analytics (if required by snippet) |

Never commit secrets. Document in `.env.example` during Phase D/E.

---

## 17. Immediate next step

1. ~~Record decisions~~ ✅ (§3)
2. ~~Repo hygiene cleanup~~ ✅ (2026-07-21 — Payload removed, GSAP-only, tokens/nav)
3. **Phase B:** wire Sanity env + finish `/studio` schemas per §7; Phase C: `lib/cms` GROQ swap

---

*Last updated: 2026-07-21 — Payload removed; fallbacks-first; Sanity scaffold at `/studio`.*
