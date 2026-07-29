# Code Standards

## General

- Keep modules small and single-purpose; high cohesion, low coupling
- Fix root causes — do not layer workarounds
- Separate concerns: routes compose sections; sections receive props; CMS logic stays in `lib/cms/`
- Build with purpose — every file and function should have a clear reason to exist
- Prefer simplicity over cleverness; readability over brevity
- Immutable data patterns — return new objects; never mutate fetched CMS data or props in place

> **Source:** [`docs/technology/engineering-principles.md`](../docs/technology/engineering-principles.md), workspace coding rules

---

## TypeScript

- Strict mode required (`strict: true` in tsconfig)
- Avoid `any` — use explicit interfaces or narrowly scoped types
- Validate unknown external input at system boundaries (CMS responses) before trusting
- Export shared content types from `lib/cms/types.ts`; pages and components import from there
- Use `satisfies` or Zod parsing at the CMS boundary when schema validation is added

---

## Next.js (App Router)

- Default to **Server Components** for pages and static sections
- Add `"use client"` only when browser interactivity is required (mobile nav toggle, light animation)
- Page files (`app/**/page.tsx`) fetch data and pass typed props to section components
- Use `generateMetadata` per route for SEO fields from CMS
- Use `generateStaticParams` for `[slug]` dynamic routes driven by CMS
- Colocate route-specific components only when not reused; shared sections live in `components/sections/`
- Do not run long-lived background work in request handlers

---

## CMS Integration

### Client and queries

- One query function per page/collection in `lib/cms/queries.ts`
- Queries return typed results or `null` — never throw for missing content (fall back instead)
- Sanity GROQ getters live in `lib/cms/queries.ts`; pages use `resolveWithFallback()` with typed fallbacks when CMS returns `null`

### Types

- Mirror CMS schema in `lib/cms/types.ts`
- Field names match CMS schema exactly (camelCase in TypeScript)
- Include `isPlaceholder?: boolean` on content types where applicable

### Fallbacks

- Placeholder content lives in `lib/cms/fallbacks/` — one file per page/collection
- Fallbacks are typed identically to CMS responses
- Resolution pattern:

```typescript
const page = (await getAboutPage()) ?? aboutPageFallback;
```

- Canon facts in fallbacks must be copied verbatim from `docs/` — add a comment citing the source path
- Never put fabricated client names, awards, or metrics in fallbacks

### Placeholder vs published content

| State | Behavior |
| --- | --- |
| CMS published entry | Render CMS content |
| CMS empty / fetch fails | Render typed fallback |
| `isPlaceholder: true` | Render content; optional visual badge in dev/preview only |
| Missing media | Show branded placeholder component |

### Environment variables

Target (Sanity + Cloudflare): see [`WEBSITE-ESSENTIAL-CONTEXT.md`](./WEBSITE-ESSENTIAL-CONTEXT.md) §16.

- `NEXT_PUBLIC_SITE_URL` for canonical/OG URLs
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` (Phase B+)
- `R2_*`, `RESEND_API_KEY`, `SANITY_REVALIDATE_SECRET` (Phase E+)
- Never commit secrets; document required vars in `.env.example` when added
- Missing CMS env: fall back to typed content — site must not white-screen

---

## Styling

- Use CSS custom property tokens from `ui-context.md` — no hardcoded hex in components
- Tailwind CSS 4 with tokens defined in `app/globals.css` (`@theme` block)
- Follow border radius scale from ui-context
- Prefer composition over deep selector chains
- Mobile-first responsive classes
- Honor `prefers-reduced-motion`

---

## Components

### Organization

```
components/
  layout/       # Header, Footer, Nav, PageShell
  sections/     # Page-specific blocks (Hero, TeamGrid, ServiceList, …)
  ui/           # Primitives (Button, Card, Badge, Container, …)
```

### Rules

- Section components are presentational — receive typed `content` props, no direct CMS calls
- UI primitives wrap tokens and variants; no page-specific copy inside primitives
- Images always use `next/image` with width, height, and alt
- Links to external contact channels use `<a>` with appropriate `href`; internal use `next/link`
- **Headings:** use `WordPullUp` for marketing `h1`/`h2` entrances; fade body/supporting text with `AnimatedSection` (see `ui-context.md` Typography motion standard)

### Naming

- Components: PascalCase (`ServiceCard.tsx`)
- Files match default export name
- CMS query functions: `get` prefix (`getHomePage`, `getServiceBySlug`)
- Fallback constants: camelCase with `Fallback` suffix (`homePageFallback`)

---

## Data and Content

- **No company facts hardcoded in JSX** — mission, team, services, products flow from CMS or fallbacks
- Metadata (titles, descriptions) from CMS `seoMetadata` or page fields
- Large media assets served from CMS CDN — not committed to repo
- `docs/assets/` is reference only until assets are uploaded to CMS or `public/`

---

## Error Handling

- CMS fetch errors: log server-side; render fallback content (site must not white-screen)
- Missing slug on dynamic route: `notFound()` from `next/navigation`
- Do not expose CMS error details or tokens to the client
- User-facing errors: friendly, on-brand copy per tone-of-voice

---

## Performance

- Static generation + ISR for marketing pages (see `architecture.md`)
- Lazy-load below-fold images; priority only for hero LCP image
- Minimize client bundle — keep interactivity small
- Avoid unnecessary `"use client"` boundaries

> **Source:** [`docs/marketing/website-guidelines.md`](../docs/marketing/website-guidelines.md) Performance Standards

---

## File Organization

| Path | Belongs here |
| --- | --- |
| `app/` | Routes, layouts, `generateMetadata`, data fetching at page level |
| `components/layout/` | Site chrome |
| `components/sections/` | Composable page blocks |
| `components/ui/` | Design system primitives |
| `lib/cms/` | Client, queries, types, fallbacks |
| `context/` | Build specs (update when architecture or scope changes) |
| `docs/` | Company canon — read-only unless explicitly instructed |

Target file size: 200–400 lines typical; extract when a module exceeds ~400 lines.

---

## Documentation

- Update `context/progress-tracker.md` after each meaningful implementation change (active phase, next steps, open questions, architecture decisions)
- When closing a phase: archive to `context/completed/YYYY-MM-DD-<slug>.md`, index in `completed/README.md`, slim the tracker
- Update relevant context file when architecture, scope, or conventions change
- Code comments only for non-obvious CMS quirks or canon source citations in fallbacks

---

## Testing (when implemented)

- Unit test fallback resolution and content type guards
- Integration test CMS query functions with mocked responses
- E2E smoke test: all 7 routes render without error
- Follow workspace TDD rules when adding test infrastructure

---

## Protected Files

Do not modify unless explicitly instructed:

- `docs/**` — company canon in this repo
- Generated CMS type files (if using codegen) — regenerate instead of hand-editing

---

## Canon Compliance (code-level)

- Vision labels in UI when rendering vision-only content
- Motto on site: **Create. Play. Inspire.**
- Contact: interim Google Form chrome CTA + `/contact` Resend form (T8/ADR-018); do not remove `INTERIM_CONTACT_FORM_URL`
- Product `developmentStatus`: default `tbd` — never hardcode `released` without canon proof
