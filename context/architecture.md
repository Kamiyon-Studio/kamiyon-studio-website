# Architecture Context

> **Target architecture:** [`WEBSITE-ESSENTIAL-CONTEXT.md`](./WEBSITE-ESSENTIAL-CONTEXT.md) (Sanity + OpenNext + R2 + Resend).  
> **Decision log:** [`DECISIONS.md`](./DECISIONS.md).

This file describes the **current repo** after cleanup. Do not treat Payload or Vercel as targets.

---

## Current stack (post Phase C data layer)

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript + React 19 | SSR, metadata, routes |
| UI | Tailwind CSS 4 + design tokens | Presentation |
| Content | Sanity GROQ via `lib/cms` + typed fallbacks | Live CMS when configured; fallbacks otherwise |
| CMS | Hosted Sanity Studio (`/studio` → redirect) | ADR-007 / ADR-009 |
| Media | Cloudflare R2 (`r2Asset` / `getMediaUrl` / upload API) | T4 done |
| Hosting | OpenNext on Cloudflare Workers (staging + prod) | Phase E / ADR-022 |
| Chrome | Kinetic overlay nav (`SiteHeader`) | ADR-008 |
| Motion | GSAP + ScrollTrigger (main site) | See `lib/gsap`, `lib/motion` |
| Tests | Vitest + Playwright | Unit + smoke E2E |

```
Visitors → Cloudflare CDN → OpenNext Worker → lib/cms GROQ → Sanity (or null) → resolveWithFallback → fallbacks
Editors → kamiyon.sanity.studio → webhook → /api/revalidate → revalidateTag → cached GROQ → pages
Media → R2 CDN (media*.kamiyonstudio.com) ← Studio upload → /api/media/upload
```

---

## Boundaries

| Path | Responsibility |
| --- | --- |
| `app/(frontend)/` | Public marketing routes |
| `components/` | Sections, layout, UI — props in, no CMS imports in leaves |
| `lib/cms/` | Public getters, types, fallbacks; Sanity swap keeps exports |
| `lib/seo/` | Metadata, JSON-LD, sitemap, robots |
| `docs/` | Company canon (read-only for agents unless asked) |
| `context/` | Build instructions, ADRs, progress |

---

## Content resolution

Every page loader follows:

```typescript
const data = resolveWithFallback(await getHomePage(), homePageFallback);
```

CMS getters return `null` when Sanity is unset, empty, or errors. Never throw for missing CMS content.

---

## Generated artifacts

- **graphify-out/** — not committed. Regenerate: `graphify update .` (see ADR-004).

---

## Next architecture step

**Phase F:** Apex DNS cutover (WS4b operator), Resend domain live (T8 ops), blog UI (T9), expanded E2E (T15).
