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

### Home partners standalone section (2026-08-15)

**ADR:** ADR-036 (supersedes ADR-023 combined opening for partners placement)  
**Status:** **Done in-repo** — `/` is hero → projects → partners → recognition → services → contact. `PartnersMarquee` is a full section (`#home-partners`) between portfolio and awards, not a hero band.

| Stream | Status | Notes |
| --- | --- | --- |
| Lift partners out of Hero | **Done** | `Hero` / `HeroOpening` / `HeroParallaxOpening` no longer take `partners` |
| Page composition + nav | **Done** | `page.tsx` + `HOME_SECTION_NAV` order: projects then partners then recognition |
| Section chrome | **Done** | Secondary bg, `py-16 md:py-24`, dark nav theme, Trusted by eyebrow |

**Ship gate:** Visual ack on `/#home-partners` between Recent Projects and Recognition.

### Home hero wordmark — primary glow (2026-08-15)

**Status:** **Done in-repo** — homepage `KAMIYON STUDIO` uses a 0-offset primary glow on a wrapper around the glyphs. Charcoal brand-scrim drop shadow removed; stage sky scrim stays for contrast.

### Home services marquee — drag + portfolio hover photos (2026-08-15)

**Status:** **Done in-repo** — `/#home-services` marquee is pointer-draggable; hover reveal images come from published portfolio `coverImage` / `gallery` on projects tagged with that service (`serviceType`). Unsplash stock pair removed. Reduced-motion stays a static list.

| Stream | Status | Notes |
| --- | --- | --- |
| JS-driven draggable vertical marquee | **Done** | `cta-with-text-marquee` rAF loop + pointer capture; click suppressed after drag |
| Portfolio hover photos | **Done** | `pickServiceHoverImages`; homepage uses all published portfolio items |
| Tests | **Done** | 25/25 on helper + marquee + ServicesStack |

**Ship gate:** Visual ack on `/#home-services` — drag the list; Game Development hover should show Eclipse shots. Other services stay text-only until tagged project photos exist.

### Home — hide TestimonialsMarquee (2026-08-15)

**ADR:** ADR-035 (supersedes ADR-031 Home display)  
**Status:** **Done in-repo** — `/` is hero → projects → recognition → services → contact. `TestimonialsMarquee` component + CMS fields kept, not mounted. Nav drops `home-testimonials`.

### About page — hide WhoWeAreBand (2026-08-15)

**ADR:** ADR-034 (supersedes ADR-030 About display)  
**Status:** **Done in-repo** — `/about` is hero → story → timeline → team. `WhoWeAreBand` component + CMS fields kept, not mounted.

### Home hero parallax v3 — two-layer video + foreground (2026-08-15)

**ADR:** ADR-033 amendment (extends ADR-029)  
**Status:** **Done in-repo** — v3 plates + MP4 + ground published to staging and production R2. Worker rebuild still required for hosted HTML to point at v3.

| Stream | Status | Notes |
| --- | --- | --- |
| Layer config `site/hero/parallax/v3`, 1920×1080 | **Done** | Video freeze-frame (`fallback.avif` + `homepage.mp4`) behind planted `foreground.avif` |
| `HeroParallaxOpening` freeze-frame + MP4 | **Done** | No WebM; no CSS mask (video is an opaque full scene) |
| Recent Projects earth plate | **Done** | `ground.avif` on `#home-projects`; `/assets/background.avif` unchanged |
| `pnpm media:hero-parallax` AVIF passthrough | **Done** | Named stills + optional MP4; PNG originals archived under `v3/source/` |
| R2 upload staging + production | **Done** | CDN HEAD 200 for stills + `homepage.mp4` on both hosts |
| Viewport-top crop + hero/projects seam | **Done** | `object-top`; `18svh` hang + charcoal dissolve; no plate mask (keeps Trusted By solid) |

**Ship gate:** Publish v3 to both media buckets, then rebuild staging/production Workers so HTML points at v3. Confirm landscape loop, freeze-frame before first frame, reduced-motion stills, and the foreground/ground join into Recent Projects.

v2 remains on R2 under `site/hero/parallax/v2/` until caches drain.

### Lean portfolio case study + Eclipse original IP (2026-08-15)

**ADR:** ADR-032  
**Status:** **Done in-repo** — `portfolio` gained a lean case-study contract (`projectType`, optional Eclipse-depth groups). `/portfolio/[slug]` renders new fields when present. Seed includes real Eclipse (`portfolio-eclipse`) plus the sample client placeholder. About roster unchanged.

| Stream | Status | Notes |
| --- | --- | --- |
| Schema + Studio groups | **Done in-repo** | Information / Overview / Case study / Gameplay / Development / Credits & recognition / Media / SEO |
| Types / GROQ / mapper / fallbacks | **Done in-repo** | Optional groups omitted when empty; legacy docs default to `client-work` |
| Seed Eclipse + placeholder | **Done in-repo** | `portfolio-eclipse` `isPlaceholder: false`; placeholder stays `client-work` |
| Case study UI | **Done in-repo** | Original IP sidebar says Studio; empty Gameplay/Technical hidden |
| ADR-032 + tracker | **Done** | This tracker |

**Ship gate:** Hosted Studio redeploy + `pnpm sanity:seed` (write token, non-prod first) so Eclipse is in the dataset. Do not add CIIT to home `award` in this pass.

### Home testimonials marquee (2026-08-14)

**Plan:** `.claude/plans/home-testimonials-marquee.plan.md` · **ADR:** ADR-031  
**Status:** **Done in-repo, hidden on Home (ADR-035)** — `testimonial` docs + `homePage.testimonials[]` kept; `TestimonialsMarquee` not mounted. Preview quotes remain in seed/fallbacks for when the band is remounted.

| Stream | Status | Notes |
| --- | --- | --- |
| **WS-A** Sanity schema + desk | **Done in-repo** | `testimonial` type; Home field after `awards` |
| **WS-B** Types / GROQ / mapper / preview seed | **Done in-repo** | `mapTestimonial`; team-roster preview quotes (2026-08-15) |
| **WS-C** `testimonial-marquee` primitive | **Done in-repo** | 0 hide · ≥1 CSS 3D marquee (`3d-testimonials`); reduced-motion static |
| **WS-D** Section + Home page + nav | **Done in-repo** | `/#home-testimonials`; `--bg-secondary` trust chapter |
| **WS-E** ADR-031 + tracker + ui-context + essential | **Done** | This tracker |
| **WS-F** Verify gate | **Done (local tests)** | Focused 83/83; eslint clean on touched (pre-existing `SanityObjectType` unused warning in constants.ts); tsc noise is pre-existing and off-path |
| **WS-V** Visual restyle (v2 layout) | **Superseded** | Replaced by 3D CSS marquee (2026-08-15) |
| **WS-V2** 3D CSS marquee | **Done (local tests)** | Four perspective columns; Card/Avatar; CMS quotes; reduced-motion static |

**Ship gate:** WS-A–F + WS-V local **PASS**. Hosted Studio **redeployed 2026-08-15**. Preview quotes on Home for visual ack; replace with consented quotes later.

### Sanity ↔ frontend align (2026-08-14)

**Plan:** `.claude/plans/sanity-frontend-align.md` · **ADR:** ADR-030  
**Status:** **Done in-repo** — Home named fields (no `blocks[]`), About WhoWeAreBand, awards `placeholderLabel`, footer `siteSettings` lifts, Rest unused Studio field drops, hosted Studio redeployed. Commit: `930b386` on `features`. Testimonials UI moved to ADR-031.

| Tracker item | Status |
| --- | --- |
| Home testimonials section | **Hidden** — ADR-035; component + CMS `testimonials[]` kept, not mounted |
| Re-seed dataset for Home named refs (`pnpm sanity:seed`) | **Operator** — schema live; dataset may still hold legacy `blocks` until seed/editors fill refs |
| Rotate `SANITY_STUDIO_MEDIA_UPLOAD_SECRET` if it must stay server-only | **Operator** — deploy warned secret is client-bundled in hosted Studio |

### About team FocusRail carousel (2026-07-30)

**ADR:** ADR-028  
**Status:** Done — `/about#team` uses minimized `FocusRail` + click-to-open card modal; About section titles (story / timeline / team) use WordPullUp display headings.

### About page — drop Vision / Values / Culture (2026-07-30)

**ADR:** ADR-027 (display unused superseded by ADR-030, then **hidden again by ADR-034**) · **Archive:** [`archive/about-vision-values-culture/`](../archive/about-vision-values-culture/README.md)  
**Status:** Done — archived VisionBand / ValuesGrid / CultureClosing stay archived. `/about` is hero → story → timeline → team. **WhoWeAreBand is hidden** (component + CMS fields kept).

### About milestone timeline + cumulative roster (2026-07-30)

**Plan:** `.claude/plans/about-timeline-sabotage-style.plan.md` · **ADR:** ADR-025  
**Note:** Waves 1–3 landed in-repo (WS-A–E). WS-F docs; WS-G verify next.

| Stream | Status | Notes |
| --- | --- | --- |
| **WS-A** `lib/timeline` contract + roster/years pure logic | **Done** | Types frozen; 15 unit tests green |
| **WS-B** Sanity schema + GROQ + mappers + fallbacks + seed | **Done** | `entryType` / `images[]` / `teamMember`; legacy `image` read path |
| **WS-C** Entry card + media frame + spine CSS | **Done** | Embla multi-image; read-more; DOM contract attrs |
| **WS-D** Sticky aside + scroll-spy + cumulative roster hooks | **Done** | Reversible roster; IO only (no GSAP) |
| **WS-E** Timeline orchestrator + StoryTimeline + About page | **Done** | `TimelineEntryV2`; xl grid; year chips below xl |
| **WS-F** ADR-025 + tracker + ui-context + plan | **Done** | ADR Accepted; layout/motion rows updated |
| **WS-G** Verify gate (vitest / lint / tsc / smoke) | **Done (local tests)** | Focused 71/71; full 761/761; lint clean on touched; tsc clean on our paths. Global branch cov 73.61% pre-existing (`media.ts` etc.). E2E smoke deferred (no server). |

**Ship gate:** Agent ownership **PASS** (A–G local). Remaining: founder visual ack (level 5) on `/about#timeline`; operator join dates for real `teamJoin` seed content (news-only fallback until then); optional E2E smoke when a local/staging server is up.

### About values hover-expand strip (2026-07-30)

**Plan:** `.claude/plans/values-expand-on-hover.plan.md` · **ADR:** ADR-024  
**Note:** **Superseded for live page by ADR-027** — section + primitive archived under `archive/about-vision-values-culture/`. Historical WS-A–E remain below for reference.

| Stream | Status | Notes |
| --- | --- | --- |
| **WS-A** `values-expand-on-hover` primitive + Unsplash `remotePattern` + tests | **Done** | Separate file from team `expand-on-hover.tsx`; `motion/react` only; fixed Unsplash images |
| **WS-B** `ValuesGrid` mapper + section tests | **Done** | Keep `#values` + “What we value”; CMS name/description on active overlay; no CMS image field |
| **WS-C** TiltedCard hygiene | **Skipped (retained)** | TiltedCard still used by FeaturedWork, CommunityCard, ProjectCard, ContactCard, Highlights, BentoProjectCard, ServiceCard, ProductCard, TeamMemberCard — do not delete |
| **WS-D** ADR-024 + tracker + ui-context + plan | **Done** | ADR-024 Accepted with A+B landed; Wave 3 finalize |
| **WS-E** Verify gate (vitest / composition / TiltedCard consumers / team strip) | **Done (local tests)** | Vitest 9/9 on A+B paths; `/about` still ValuesGrid + TeamGrid; team `expand-on-hover` untouched |

**Ship gate:** Agent ownership **PASS** (A+B + E). Remaining: founder visual ack (level 5) on `/about#values`. Team expand strip untouched.

### Phase F — Production surfaces + apex cutover (2026-07-30)

**Prior:** Phase E archived — [`completed/2026-07-30-phase-e-cloudflare-opennext.md`](./completed/2026-07-30-phase-e-cloudflare-opennext.md) · **ADR-022**

| Surface | URL | Status |
| --- | --- | --- |
| Staging site | https://kamiyon-studio-website-staging.limosnerosherwin.workers.dev | Live |
| Hosted Studio | https://kamiyon.sanity.studio/ | Live |
| Media CDN (staging / prod) | media-staging / media.kamiyonstudio.com | Active |
| Production Worker | https://kamiyon-studio-website.limosnerosherwin.workers.dev | Live + re-smoked 2026-07-30 |
| Production site | https://kamiyonstudio.com | Still on Vercel until WS4b |

**Source of truth:** [`WEBSITE-ESSENTIAL-CONTEXT.md`](./WEBSITE-ESSENTIAL-CONTEXT.md) · [`DECISIONS.md`](./DECISIONS.md) · [`deploy-runbook.md`](./deploy-runbook.md) · [`QA-Report.md`](./QA-Report.md)

### Home partners continuous logo marquee (2026-07-30)

**Plan:** `.claude/plans/home-partners-continuous-marquee.plan.md` · **ADR:** ADR-026  
**Note:** Wave 1–3 landed in-repo (WS-A + WS-B + WS-C). Extends ADR-023 band; CMS unchanged.

| Stream | Status | Notes |
| --- | --- | --- |
| **WS-A** `logo-marquee` + horizontal CSS keyframes + tests | **Done in-repo** | `components/ui/logo-marquee{,.test}.tsx`; `globals.css` `--animate-marquee-horizontal` |
| **WS-B** `PartnersMarquee` rewrite + section tests | **Done in-repo** | Continuous loop; larger logos; grayscale→color on hover/focus; drops Embla |
| **WS-C** ADR-026 + tracker + ui-context | **Done** | Soft finalize with A+B |
| **WS-D** Verify gate (vitest / visual `/#home-partners`) | **Done (local tests)** | Vitest 26/26 on logo-marquee + PartnersMarquee + HeroOpening; founder visual ack still open |

**Ship gate:** WS-A + WS-B required. Founder visual ack (level 5) on `/#home-partners`.

### Home hero + partners combined opening (2026-07-30)

**Plan:** hero+partners combine · **ADR:** ADR-023  
**Note:** WS-A–D implementation landed in-repo; WS-E docs (this tracker + `ui-context` + ADR-023).

| Stream | Status | Notes |
| --- | --- | --- |
| **WS-A–D** Combined opening stage | **Done in-repo** | Brand + motto upper; `PartnersMarquee layout="band" tone="onDark"` lower; `#home-partners` + dark nav; standalone light partners section removed; soft bottom scrim; CMS unchanged |
| **WS-E** Context docs | **Done** | `ui-context` Home layout; ADR-023; this tracker |

**Ship gate:** Opening is one full-bleed stage; section-nav label still “Trusted by”.

### Home services vertical marquee (2026-07-29)

**Plan:** `.claude/plans/home-services-vertical-marquee.plan.md` · **ADR:** ADR-021  
**Note:** Wave 1–2 landed in-repo (WS-A + WS-B + WS-D). WS-C optional; WS-E verify next.

| Stream | Status | Notes |
| --- | --- | --- |
| **WS-A** `cta-with-text-marquee` + CSS keyframes + tests | **Done in-repo** | `components/ui/cta-with-text-marquee{,.test}.tsx`; `globals.css` animate tokens |
| **WS-B** `ServicesStack` rewrite + section tests | **Done in-repo** | Each title → `/services/{slug}`; no ScrollStack cards |
| **WS-C** ScrollStack retirement | **Done** | Deleted unused `ScrollStack` + test/CSS (knip hygiene 2026-08-14) |
| **WS-D** ADR-021 + tracker + ui-context | **Done** | Soft finalize with A+B |
| **WS-E** Verify gate (vitest / lint / tsc / visual `/#home-services`) | **Done (local tests)** | Vitest 9/9 on A+B; founder visual ack still open |

**Ship gate:** WS-A + WS-B required. Founder visual ack (level 5) on `/#home-services`.

### Contact FAQ interactive accordion (2026-07-29)

**Plan:** `.claude/plans/contact-faq-interactive-accordion.plan.md` · **ADR:** ADR-020  
**Note:** Agent workstreams A–E complete. FAQ ship gate **PASS** (15/15 vitest; Accordion deleted; `/contact#faq` HTML + 8-item JSON-LD). Pre-existing build/tsc/knip reds unrelated. **Wave 4:** founder visual sign-off pending.

| Stream | Status | Notes |
| --- | --- | --- |
| **WS-A** InteractiveAccordion primitive + tests | **Completed** | `InteractiveAccordion.tsx` + 9 tests; R1 fallback: no AnimatePresence |
| **WS-B** ContactFAQ wiring + mapper | **Completed** | ContactFAQ wired; 6/6 tests |
| **WS-C** Legacy Skeleton Accordion delete | **Completed** | `Accordion.tsx` + `Accordion.test.tsx` deleted; ContactFAQ+InteractiveAccordion 15/15 green |
| **WS-D** ADR-020 + tracker + ui-context | **Completed** | ADR-020 recorded; status refresh after A+B |
| **WS-E** Verify gate (test / lint / tsc / knip / build / visual) | **Completed** | FAQ-scope PASS; pre-existing build/tsc/knip noise unrelated |

**Ship gate:** Agent FAQ ownership **PASS**. Remaining: founder visual ack (level 5 / Wave 4) on `/contact#faq`.

### Security remediation — contact + media (2026-07-29)

**Plan:** `.claude/plans/security-remediation-contact-media.plan.md` · **ADR:** ADR-019 · **Review:** [`security-review-contact-api-2026-07-29.md`](./security-review-contact-api-2026-07-29.md)

| Stream | Status | Notes |
| --- | --- | --- |
| **WS-A** Contact header injection | **Done in-repo** | C0 reject in validate; `sanitizeHeaderValue` on subject/`replyTo` |
| **WS-B** Media MIME + size cap | **Done in-repo** | Allowlist + 10 MiB; 415/413 before buffer |
| **WS-C** ADR + tracker + review status | **Done** | ADR-019; review Status → Fixed |
| **WS-D** Integration gate | **Done (local)** | Vitest 657/657; coverage ≥80% on touched libs; lint/tsc/knip pre-existing noise only; staging still operator |

**Ship gate:** WS-A + WS-D required before announcing live contact form. WS-B not blocking ship but landed in same pass. Staging confirm (malicious name → 400; SVG → 415) still operator.

### IA consolidation + Sanity cleanup (2026-07-29) — **committed**

**Plan:** `.claude/plans/6-page-ia-consolidation-sanity-cleanup.plan.md` · **ADR:** ADR-017  
**Commit:** `dd3a0a7` (Gate 0 / IA + services on `test`; working tree was clean when Phase 8 was revisited 2026-07-29)

| Phase | Status |
| --- | --- |
| 1–7 | Done |
| 8 Commit | **Done** — already in `dd3a0a7`; no further uncommitted IA diff |

### Services refactor — Gate 3 PASS_WITH_NOTES (2026-07-29)

**Artifact:** [`gate0-services-taxonomy.md`](./gate0-services-taxonomy.md) · **ADR:** ADR-016 (+ Gate 1 live-remap + Gate 3 closeout) in [`DECISIONS.md`](./DECISIONS.md)

| Gate / stream | Status | Notes |
| --- | --- | --- |
| Gates 0–3 / WS-A–H | **Done / PASS_WITH_NOTES** | Vitest green at Gate 3; Playwright 18/18 |
| **WS-C migrate `--apply`** | **Human-gated** | Dry-run only in repo. **Do not `--apply` without human dry-run sign-off. Production mutation forbidden.** |

**Hard rules:** No live/prod CMS `--apply` without human dry-run sign-off. Optional `--apply` is ready for **non-prod only** after human approval.

---

**Phase E** — Done / archived 2026-07-30 → [`completed/2026-07-30-phase-e-cloudflare-opennext.md`](./completed/2026-07-30-phase-e-cloudflare-opennext.md) (ADR-022). Apex DNS cutover remains under WS4b below.

---

## Locked product answers (2026-07-24)

| Topic | Decision |
| --- | --- |
| Interim contact CTA | External [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSeIefAWJu5FP9pwljLFz1wSUxU2ybR3--GdylUYUBsGHH0yaw/viewform) (linked button) |
| Google Form CTA after T8 | **Retain** — chrome “Get in touch” stays on the Google Form |
| QA-001 | Out of app scope — Google Forms confirmation settings |
| Same-route nav | Smooth-scroll to top / target section |
| Scroll tip | Keep bounce UX; first scroll must count |
| QA-008 hamburger | Superseded by kinetic nav (ADR-008) |
| QA vs Wave 4 | Parallel |
| T8 | Resend → studio inbox + visitor confirmation; `CONTACT_TO_EMAIL` = `kamiyonstudio@gmail.com` |

---

## Parallel workstreams (multitask fan-out)

| Stream | Scope | Status |
| --- | --- | --- |
| **WS0–WS3, WS4a, WS8** | Context / hero / chrome / same-route / staging ops / seed | **Done** |
| **WS4b** | Apex/www → prod Worker; pause Vercel | **Prod Worker live**; Sanity CORS for apex+www **added 2026-07-30**; remaining = **operator dashboard** (DNS attach, webhook, Studio bake, Vercel pause) |
| **WS5** | T8 Resend native form | **Done in-repo** (ADR-018) — awaiting Resend domain verify + Worker secrets for live send |
| **WS6** | T9 blog UI / T14 analytics | T14 done; T9 optional |
| **WS7** | T15 E2E expansion | **Later** — expand after Resend domain live (form path ready) |

**WS4b operator checklist** (human-only; details in [`dns-cutover-guide.md`](./dns-cutover-guide.md) + [`deploy-runbook.md`](./deploy-runbook.md) “WS4b — Production cutover”):

1. Cloudflare Workers → production Worker → **Custom domains**: attach `kamiyonstudio.com` + `www` (or Workers Routes + redirect).
2. ~~Sanity → API → **CORS**: add `https://kamiyonstudio.com` (+ `www`)~~ — **done 2026-07-30**.
3. Sanity → **Webhook**: point revalidate URL at production `/api/revalidate` (Bearer = prod `SANITY_REVALIDATE_SECRET`).
4. Redeploy hosted Studio with `SANITY_STUDIO_API_ORIGIN=https://kamiyonstudio.com`.
5. Smoke apex for 24–48 h, then **pause/remove Vercel** DNS/project.
6. Optional: set `workers_dev: false` on production after apex is live.

**Do not** invent secrets or change production DNS from this agent session.

---

## Current Goal

1. **Ops (manual):** Re-seed Sanity Home named refs; confirm Studio Home lists populate staging/prod without blank sections.  
2. **Ops:** **WS4b** apex DNS cutover (operator dashboard) — CORS already set.  
3. **Resend:** verify `send.kamiyonstudio.com` in Resend (DKIM/SPF) + apex DMARC `p=none`; then `wrangler secret put RESEND_API_KEY` (+ set `CONTACT_FROM_EMAIL` / `CONTACT_TO_EMAIL` Worker vars).  
4. **Security (manual):** Decide whether to rotate `SANITY_STUDIO_MEDIA_UPLOAD_SECRET` (hosted Studio deploy bundles `SANITY_STUDIO_*`).  
5. **Human:** optional non-prod services migrate `--apply` after dry-run sign-off (prod still forbidden).  
6. Optional: WS6 blog UI (T9 / #29); WS7 E2E once Resend is live. Home testimonials UI is in-repo (ADR-031); operators add real Studio quotes + redeploy hosted Studio.

---

## Next Up (resume here)

### Human / ops blockers (cannot be fully automated by agents)

1. **Sanity re-seed for ADR-030 Home named refs** — run `pnpm sanity:seed` (write token) against the non-prod dataset so `homePage` gets `partners` / `portfolioItems` / `awards` / `services` / `contactCta`. Confirm https://kamiyon.sanity.studio Home fields match the live page.  
2. **Visual smoke after seed** — staging Worker: Home sections (no TestimonialsMarquee) + About (no WhoWeAreBand) + footer CMS strings.  
3. **WS4b DNS cutover** — operator checklist above (Cloudflare custom domains, prod webhook, Studio `SANITY_STUDIO_API_ORIGIN`, pause Vercel).  
4. **Resend domain + Worker secrets** — verify subdomain + DMARC; `wrangler secret put RESEND_API_KEY`; set from/to vars.  
5. **Studio media upload secret** — if upload auth must stay server-only, rotate secret and stop baking it into Studio client env.  
6. **Services migrate `--apply`** — dry-run sign-off required; **prod forbidden**.  
7. **GitHub Actions secrets** — confirm `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (and optional `NEXT_PUBLIC_*` vars).  
8. **CMS content edits (Studio only)** — Luis role (#27); add Harvey/Danielle/Kien (#24); real portraits (#23); team social links (#26).  
9. **WS7 / WS6** — Playwright contact form after Resend live; blog UI (#29).  
10. **Home testimonials** — section hidden (ADR-035). Remount only after consented client/partner quotes exist; do not treat team-roster preview quotes as social proof.

### Deferred — do not implement

| Item | Notes |
| --- | --- |
| Press Kit (`/pres`) | Content/decision deferred |
| Portfolio taxonomy filters | Wait for ≥6 real case studies |

---

## Open Questions

- [x] **Resend from-address / `CONTACT_TO_EMAIL` plan** — Locked 2026-07-26; implemented in-repo 2026-07-29 (ADR-018).  
  **Still human:** verify `send.kamiyonstudio.com` in Resend (DKIM + SPF), add apex DMARC at `p=none` with `rua`, Cloudflare Email Routing `hello@` → Gmail, set Worker `RESEND_API_KEY` (+ vars). Zone has no MX/SPF/DMARC yet — independent of WS4b.

---

## Deferred — decided, not scheduled

| Item | Decision | Revisit trigger |
| --- | --- | --- |
| **Press Kit** (`/pres`) | Out of v1 | First press inquiry / product launch |
| **Portfolio taxonomy filters** | Client chips over `industry` when content exists | ≥6 real case studies across ≥3 industries |

---

## Resolved (formerly open)

- [x] **`/news` route** — Won't build; `/blog` is announcements.
- [x] **README motto** — Create. Play. Inspire.
- [x] **R2 / Studio hostnames** — Active.
- [x] **Interim contact + retain Google Form after T8** — Wired; Form stays chrome CTA.
- [x] **T8 Resend in-repo** — ADR-018 (2026-07-29).

## Architecture Decisions (active)

See [`DECISIONS.md`](./DECISIONS.md) (incl. ADR-016/017/018/019/020/021/022/023/024/025/026/027/028/029/030/031/032).
