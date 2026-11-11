# Frontend/content implementation evidence

Branch: `codex/frontend-content`.
Worktree: `O:/Documents/GitHub/kamiyon-frontend-content`.
Deployment and live CMS content were not changed.
The root orchestrator reviewed task diffs before commits and coordinates specialist review and integrated CI.

| Finding | Commit | Implementation and evidence |
| --- | --- | --- |
| 2 | c80d569 | All JSON-LD callers use safe serialization; parsed hostile DOM test passes; SEO suite47 passed at this step. |
| 5 | 51f3317 | Blog images, safe links, nested ordered/bullet lists preserved; mapper-to-renderer fixture included; richtext/navigation20 tests passed. |
| 7 | f4cc4c9 | Overlay inert handling, focus wrapping/restoration and dialog semantics;14 component tests plus real Chromium Tab/ShiftTab/Escape proof. |
| 10 | 79067db | Factual proposition and direct work/inquiry actions; hero/filter/marker12 tests passed; desktop1440x900 and mobile390x844 screenshots inspected. |
| 20 | 7f47286 |44px marker targets and hidden redundant one-category filter; focused tests and mobile overflow check passed. |
| 6 integration | d1c70e4 | Detail pages do not resurrect demo slugs in production; home singleton follows policy; direct route404 regression passed. Depends on CMS core22258c8, cherry-picked here as14899c6. |
| 16 UI | c89fdae | Route and global error states include retry and independent existing studio email; reset/email test passed. |
| 13 | bd54164 | Absolute branded titles, article type, updated sitemap dates, stable generated sharing-image route;49 SEO tests passed. Chromium verified Eclipse title has one brand suffix; sharing image returned200 image/png. |
| 2 headers | 6dc4684 | nosniff, referrer, framing/permissions protection, production HSTS, report-only CSP. Preview headers verified; CSP currently provides browser-console observations, not centralized reports. |
| 19 | 7dc4153 | Current motion ownership reconciled throughout project guidance; historical completion records retained with explicit reconciliation. |
| 9 | 694df65 | Canon-based service scope/brief copy, related portfolio links, noindex demo posts, future milestone labels, revision-safe publication proposal;18 focused tests passed. Actual publication remains deferred. |
| 11 | 97fcc45 | Hero/video/carousel/service/partner pause controls, reduced-motion video source suppression, offscreen/visibility handling, MotionValue progress instead of per-frame React state. Four real Chromium regressions passed, including zero video requests under reduced motion and persistent pause. |

## Verification

- `node node_modules/vitest/vitest.mjs run lib/seo --maxWorkers=2`:47 passed before metadata changes; later SEO run49 passed.
- Rich-text and navigation component run:20 passed, including mapped blog content and focus containment.
- Navigation after inert attribute adjustment:14 passed.
- Hero tests after media API mocks:16 passed.
- Interrupted fast-forward and planned-label regression run:7 passed.
- Logo/service marquee and partner tests:34 passed.
- Final editorial service/blog/timeline run:18 passed.
- Route error and production missing-content tests:2 passed.
- Chromium accessibility suite:4 passed in10.5 seconds against isolated webpack preview3103 with `APP_ENV=local`, `CMS_DEMO_CONTENT=true`, and the public R2 media base configured.
- Changed-component ESLint passed after moving timeline evaluation to the server data boundary.
- Standalone TypeScript retained36 baseline errors at the last stream-only check; no new errors were reported for changed implementation files. Platform fixes and full integrated checks are owned by the orchestrator.

The browser suite lives in `e2e/accessibility.spec.ts`.
It verifies navigation focus, reduced-motion video network suppression, background pause, and persistent service/partner pause.
The video path requires the public R2 base during the local test build; otherwise the legitimate static hero fallback has no video controls.

## Rendered evidence

Local ignored artifacts remain in `.cache/`:

- `home-desktop.png`, `home-mobile.png`: proposition and actions fit both viewports; no mobile horizontal overflow.
- `menu-mobile.png`: settled menu layout, all routes and CTA visible.
- `home-paused-mobile.png`: pause control visible; screenshot caught the wordmark entrance mid-animation, not a missing title.
- `service-mobile.png`: complete service copy and portfolio link fit mobile.
- `service-pause-mobile.png`, `partner-pause-mobile.png`: persistent pause controls visible and clickable without clipping.
- `accessibility-browser.log`, `editorial-seo-browser.log`, `editorial-final-tests.log`, `motion-regression.log`, `marquee-tests.log`, `frontend-lint.log`: command evidence.

The preview's default metadata origin was localhost3000 while the isolated server ran3103.
The social image URL path was fetched on3103 and returned200 image/png; production origin continues to come from its existing configured site URL.

## Limits and deployment handoff

The initial Turbopack dev compiler failed in its internal Google Font query resolver with “next/font/google queries have exactly one entry.”
The repository's webpack path rendered successfully; no font workaround or dependency upgrade was added.
The build specialist received the exact observed error and source import trace.

No live CMS document was edited or unpublished.
`editorial-publication-proposal.md` describes source proposals and revision-checked publication preparation, preserving editor-written bodies and drafts.
The live service placeholder flags and stub posts therefore remain unchanged until a separately authorized deployment/publication step.

No measured Core Web Vitals improvement is claimed.
Final combined build, full type/lint/unit/browser checks and remote CI must be reported by the orchestrator after integration.
