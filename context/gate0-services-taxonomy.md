# Gate 0 — Five-Service Taxonomy & Remap Artifacts

> **Status:** Locked (Gate 0) + live remap extensions folded at Gate 1 (2026-07-29).  
> **Source:** Product brief (2026-07-29) + adopted parallel workstream plan + WS-C live dry-run.  
> **Do not invent** clients, case studies, or merge targets beyond this matrix.  
> **Integrator-owned** at Gate 0/1/2. Workstreams must not edit this file.

---

## 1. Approved taxonomy (fixed order)

Exactly **five** top-level `service` documents. No other standalone offerings.

| Order | Title | Slug | Tagline |
| --- | --- | --- | --- |
| 1 | Game Development | `game-development` | Build immersive games that inspire, educate, and entertain. |
| 2 | Product Development | `product-development` | Transform ideas into modern digital products. |
| 3 | UI & Design | `ui-design` | Design experiences people love to use. |
| 4 | Branding | `branding` | Build memorable brands with purpose. |
| 5 | Community & Events | `community-events` | Grow communities through meaningful experiences. |

### Descriptions (verbatim from brief)

**Game Development** — We partner with studios, startups, organizations, and businesses to create engaging game experiences—from rapid prototypes to polished commercial titles. Whether it's entertainment, education, or gamified learning, we focus on delivering meaningful interactive experiences. *(Flagship — always first.)*

**Product Development** — We design and build digital products that solve real-world problems. From startup MVPs to internal platforms, we help organizations launch products that are functional, scalable, and user-focused. *Do NOT market as "software development."*

**UI & Design** — We create intuitive interfaces and visually compelling assets that elevate products, games, and brands through thoughtful design and user-centered experiences. *(Execution / digital design.)*

**Branding** — A strong brand is more than a logo. We help organizations create cohesive visual identities that communicate their story consistently across every touchpoint. *(Separate from UI & Design: branding = identity; UI & Design = product/experience execution.)*

**Community & Events** — We help organizations foster thriving developer, gaming, and technology communities through engaging programs and collaborative events that create lasting impact. *NOT event management — community growth / DevRel / ecosystem engagement.*

### Capabilities (verbatim from brief)

| Slug | Capabilities |
| --- | --- |
| `game-development` | Full-cycle game development; Game prototyping; Gameplay programming; Multiplayer implementation; Educational games; Serious games |
| `product-development` | MVP development; Web applications; Mobile applications; AI-powered features |
| `ui-design` | UI/UX design; Product interface design; Graphic design; Marketing assets; Social media creatives |
| `branding` | Brand identity; Logo design; Visual identity systems; Brand guidelines; Presentation design |
| `community-events` | Community building; Community management; Hackathons; Game jams; Workshops; Seminars; Meetups; Developer programs; Partnership activations |

### Schema shape (Gate 0 lock)

- **Flat five `service` documents.** Deprecate / remove `serviceCategory` from public IA, Studio desk emphasis, seed, and (via WS-A) schema when safe.
- **Field map for WS-A / WS-B:**

| Brief / intent | Field | Notes |
| --- | --- | --- |
| Title | `title` | Required |
| Slug | `slug` | Required; values above |
| Tagline | `tagline` | **New** string field |
| Description | `summary` (+ optional `body` portable) | Seed `summary` from Description; `body` may start as one portable block from the same text |
| Capabilities | `capabilities` | string[]; **replaces** `outcomes` |
| Order | `order` | 1–5 fixed |
| SEO | `seo` | Keep |
| Placeholder | `isPlaceholder` | Keep until real copy/media |
| — | `category` / `categorySlug` | **Remove** (flat model) |
| — | `outcomes` | **Rename → `capabilities`** |
| — | `relatedIndustries` | Not in brief; omit from new fallbacks (WS-E drops industries band if unused) |
| — | `icon` | Optional UI glyph; not in brief — WS-B may set sensible defaults |

Future AI / blockchain / DevOps / consulting = **capabilities inside these five**, never new top-level services.

---

## 2. Current inventory (code / seed — read-only survey)

### Old categories (4) — all obsolete

| Slug | Title |
| --- | --- |
| `interactive-experience-development` | Interactive Experience Development |
| `software-development` | Software Development |
| `creative-design-services` | Creative & Design Services |
| `consulting-technical-advisory` | Consulting & Technical Advisory |

### Old services (10) — from `lib/cms/fallbacks/services.ts` (+ seeded IDs `service-{slug}`)

| Slug | Title | categorySlug |
| --- | --- | --- |
| `game-development` | Game Development | interactive-experience-development |
| `mvp-development` | MVP Development | software-development |
| `gamification` | Gamification | interactive-experience-development |
| `web-development` | Web Development | software-development |
| `mobile-development` | Mobile Development | software-development |
| `ui-ux-design` | UI/UX Design | creative-design-services |
| `ai-integration` | AI Integration | consulting-technical-advisory |
| `blockchain-solutions` | Blockchain Solutions | consulting-technical-advisory |
| `consultation` | Consultation | consulting-technical-advisory |
| `creative-services` | Creative Services | creative-design-services |

All current fallback services are `isPlaceholder: true`. Live dataset seeded from these (ADR-011). **No case study ↔ service references** exist in schema/fallbacks today (`caseStudy` has `industry` only).

### Absent from code (still banned as offerings)

- Creative Direction (listed in brief removals; not present in fallbacks)

---

## 3. Remap matrix (old → new)

| Old slug | Action | New slug | Notes |
| --- | --- | --- | --- |
| `game-development` | **keep / update** | `game-development` | Same slug; replace copy with brief |
| `mvp-development` | **merge** | `product-development` | MVP is a Product capability |
| `web-development` | **merge** | `product-development` | Web applications capability |
| `mobile-development` | **merge** | `product-development` | Mobile applications capability |
| `ai-integration` | **merge** | `product-development` | AI-powered features capability; not top-level |
| `gamification` | **merge** | `game-development` | Educational / serious games under flagship |
| `ui-ux-design` | **rename** | `ui-design` | Title becomes "UI & Design" |
| `creative-services` | **delete** | — | Capabilities already covered by `branding` + `ui-design` brief lists; no single merge target — delete doc |
| `blockchain-solutions` | **delete** | — | Not a brief capability line; future-only inside Product if needed |
| `consultation` | **delete** | — | Not a top-level outcome; advisory folded into engagements |
| *(new)* | **create** | `product-development` | From merges + brief copy |
| *(new)* | **create** | `branding` | Brief-only |
| *(new)* | **create** | `community-events` | Brief-only |
| *(new)* | **create** | `ui-design` | Via rename from `ui-ux-design` |

#### Live dataset extensions (Gate 1 fold-in — WS-C dry-run 2026-07-29)

UUID-backed docs in `kamiyon` outside the Gate 0 seed inventory. Human-approved; mirrored in `scripts/sanity/migrate-services/matrix.ts` `LIVE_*`.

| Old slug | Action | New slug | Notes |
| --- | --- | --- | --- |
| `community-growth-management` | **merge** | `community-events` | Live-only; → Community & Events |
| `creative-direction-branding` | **merge** | `branding` | Live-only; → Branding |
| `game-dev` | **merge** | `game-development` | Live-only alias; → flagship |

### Categories

| Old category slug | Action | Notes |
| --- | --- | --- |
| `interactive-experience-development` | **delete** | Gate 0 |
| `software-development` | **delete** | Gate 0 |
| `creative-design-services` | **delete** | Gate 0 |
| `consulting-technical-advisory` | **delete** | Gate 0 |
| `community-building` | **delete** | Live extra (Gate 1) |
| `creative-direction` | **delete** | Live extra (Gate 1) |
| `game-development` | **delete** | Live extra category doc (not the service) |

### Case studies / clients

| Item | Action |
| --- | --- |
| All `caseStudy` docs / clients | **Preserve** — no service ref to remap today |
| Future portfolio ↔ service links (WS-F) | Use only the five slugs above |

If WS-C dry-run finds a live doc whose slug is **not** in this matrix, **STOP** and ask — do not invent.

---

## 4. Redirect list (for WS-G)

Paths are under `/services/[slug]`.

| Old path | New path | Rationale |
| --- | --- | --- |
| `/services/game-development` | `/services/game-development` | No redirect (same) |
| `/services/mvp-development` | `/services/product-development` | merge |
| `/services/web-development` | `/services/product-development` | merge |
| `/services/mobile-development` | `/services/product-development` | merge |
| `/services/ai-integration` | `/services/product-development` | merge |
| `/services/gamification` | `/services/game-development` | merge |
| `/services/ui-ux-design` | `/services/ui-design` | rename |
| `/services/creative-services` | `/services` | delete → index (split capabilities) |
| `/services/blockchain-solutions` | `/services` | delete → index |
| `/services/consultation` | `/services` | delete → index |
| `/services/community-growth-management` | `/services/community-events` | live merge (Gate 1) |
| `/services/creative-direction-branding` | `/services/branding` | live merge (Gate 1) |
| `/services/game-dev` | `/services/game-development` | live merge (Gate 1) |
| `/services/product-development` | *(new — no old)* | — |
| `/services/branding` | *(new — no old)* | — |
| `/services/community-events` | *(new — no old)* | — |
| `/services/ui-design` | *(new via rename)* | — |

Category paths were never public routes (categories are groupings only) — no category redirects.

Implement in `next.config.ts` `redirects()` (WS-G exclusive) after Gate 1.

---

## 5. Removed standalone services / categories

Must not appear as top-level offerings in CMS, Studio, nav, filters, seed, or IA:

**Services / titles:** Creative Direction · Creative Services · UI/UX Design · Web Development · Mobile Development · AI Integration · Blockchain Solutions · Gamification · Consultation · Consulting & Technical Advisory · duplicate Game Development · MVP Development (as standalone) · Software Development (as service marketing label)

**Categories:** Interactive Experience Development · Software Development · Creative & Design Services · Consulting & Technical Advisory

---

## 6. Ownership map

### Exclusive workstreams (do not cross-edit)

| Stream | Owns |
| --- | --- |
| **WS-A** | `sanity/schemaTypes/**` (esp. `service`, `serviceCategory`), `sanity/structure.ts`, related schema tests |
| **WS-B** | `lib/cms/types` (service-related), `lib/cms/fallbacks/services*`, `scripts/sanity/seed/builders/services.ts`, seed ids/tests for services |
| **WS-C** | New/updated migration script under `scripts/sanity/**` + its tests (**dry-run default**; no prod `--apply` until Gate 2 + human sign-off) |
| **WS-D** | Service GROQ / fetchers / `lib/cms/mappers.ts` service parts *(after Gate 1)* |
| **WS-E** | `app/(frontend)/services/**`, services-only presentation components, services metadata copy *(after Gate 1)* |
| **WS-F** | Portfolio filter UI + case-study↔service frontend linking *(after Gate 1)* |
| **WS-G** | Redirects config, sitemap service entries, SEO helpers for service URLs *(after Gate 1; uses this redirect list)* |
| **WS-H** | Dead code / knip cleanup for old services *(after Gate 2)* |

### Integrator only (Gate 0 / 1 / 2 shared)

| Phase | Integrator may edit |
| --- | --- |
| **Gate 0** | `context/gate0-services-taxonomy.md`, `context/progress-tracker.md`, `context/DECISIONS.md` (this ADR) |
| **Gate 1** | Generated Sanity/TS types (`pnpm sanity:schema` → `schema.json`) + boundary type fixes only after WS-A/B/C dry-run; fold approved live remaps into this artifact |
| **Gate 2** | Shared import wiring across streams; full unit suite; optional non-prod WS-C `--apply` after dry-run sign-off |

**Must not (Gate 0):** frontend pages, live CMS mutation, WS-A/B/C implementation files.

---

## 7. Inventory touchpoints (for later streams — do not edit in Gate 0)

Schema/seed: `sanity/schemaTypes/documents/service.ts`, `serviceCategory.ts`, `sanity/structure.ts`, `scripts/sanity/seed/builders/services.ts`, `scripts/sanity/seed/ids.ts`  
CMS: `lib/cms/fallbacks/services.ts`, `lib/cms/types.ts`, `lib/cms/groq.ts`, `lib/cms/mappers.ts`, `lib/cms/queries.ts`  
UI: `app/(frontend)/services/**`, `components/sections/Services*`, `ServiceDetail*`, `ServiceCard*`, `lib/services/group-by-category*`, `lib/services/related-industries*`  
SEO/E2E: `app/sitemap.ts`, `next.config.ts` redirects, `e2e/smoke.spec.ts`  
Copy mentions (non-schema): `lib/cms/fallbacks/contact.ts`, `lib/cms/fallbacks/about.ts` (FAQ/about prose — WS-H / copy pass)

---

*Gate 0 recorded 2026-07-29. Live remap extensions folded at Gate 1 (2026-07-29).*
