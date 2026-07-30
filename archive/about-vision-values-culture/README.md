# Archived: About Vision / Values / Culture sections

**Date:** 2026-07-30  
**Reason:** Operator removed these sections from the live `/about` composition. Page now flows: hero → our story → timeline → team.

## What was archived

| Former live path | Archive path |
| --- | --- |
| `components/sections/VisionBand.tsx` (+ test) | `sections/VisionBand.tsx` |
| `components/sections/ValuesGrid.tsx` (+ test) | `sections/ValuesGrid.tsx` |
| `components/sections/CultureClosing.tsx` (+ test) | `sections/CultureClosing.tsx` |
| `components/ui/values-expand-on-hover.tsx` (+ test) | `ui/values-expand-on-hover.tsx` |

## Still in CMS (not deleted)

Sanity `aboutPage` fields `vision`, `values[]`, `cultureSummary` remain in schema, GROQ, mappers, fallbacks, and seed so content is not lost. They are simply unused by the frontend page. Restore by moving files back under `components/` and re-wiring `app/(frontend)/about/page.tsx`.

## Related ADRs

- ADR-024 (values hover-expand) — presentation archived; decision retained historically
- ADR-027 — About page drops Vision / Values / Culture sections

## Restore checklist

1. Move files back to `components/sections/` and `components/ui/`
2. Re-import and mount in `about/page.tsx`
3. Restore e2e `#values` assertion if desired
4. Re-enable Unsplash usage only if ValuesGrid returns
