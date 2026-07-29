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

**Phase E — Wave 3 verified (2026-07-24):** Staging Worker + hosted Studio confirmed working. **Wave 4 (apex DNS cutover) is next**, run **in parallel** with remaining polish.

| Surface | URL | Status |
| --- | --- | --- |
| Staging site | https://kamiyon-studio-website-staging.limosnerosherwin.workers.dev | Live |
| Hosted Studio | https://kamiyon.sanity.studio/ | Live |
| Media CDN (staging / prod) | media-staging / media.kamiyonstudio.com | Active |
| Production Worker (no domain yet) | https://kamiyon-studio-website.limosnerosherwin.workers.dev | Live + smoked 2026-07-29 (`200` HTML) |
| Production site | https://kamiyonstudio.com | Still on prior host until Wave 4 |

**Source of truth:** [`WEBSITE-ESSENTIAL-CONTEXT.md`](./WEBSITE-ESSENTIAL-CONTEXT.md) · [`DECISIONS.md`](./DECISIONS.md) · [`deploy-runbook.md`](./deploy-runbook.md) · [`QA-Report.md`](./QA-Report.md)

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
| **WS4b** | Apex/www → prod Worker; pause Vercel | **Prod Worker live**; remaining = **operator dashboard** (see checklist below) |
| **WS5** | T8 Resend native form | **Done in-repo** (ADR-018) — awaiting Resend domain verify + Worker secrets for live send |
| **WS6** | T9 blog UI / T14 analytics | T14 done; T9 optional |
| **WS7** | T15 E2E expansion | **Later** — expand after Resend domain live (form path ready) |

**WS4b operator checklist** (human-only; details in [`dns-cutover-guide.md`](./dns-cutover-guide.md) + [`deploy-runbook.md`](./deploy-runbook.md) “WS4b — Production cutover”):

1. Cloudflare Workers → production Worker → **Custom domains**: attach `kamiyonstudio.com` + `www` (or Workers Routes + redirect).
2. Sanity → API → **CORS**: add `https://kamiyonstudio.com` (+ `www` if used); credentials as needed.
3. Sanity → **Webhook**: point revalidate URL at production `/api/revalidate` (Bearer = prod `SANITY_REVALIDATE_SECRET`).
4. Redeploy hosted Studio with `SANITY_STUDIO_API_ORIGIN=https://kamiyonstudio.com`.
5. Smoke apex for 24–48 h, then **pause/remove Vercel** DNS/project.
6. Optional: set `workers_dev: false` on production after apex is live.

**Do not** invent secrets or change production DNS from this agent session.

---

## Current Goal

1. **Human:** optional non-prod WS-C `--apply` after dry-run sign-off (prod still forbidden).  
2. **Ops:** **WS4b** apex DNS cutover (operator dashboard).  
3. **Resend:** verify `send.kamiyonstudio.com` in Resend (DKIM/SPF) + apex DMARC `p=none`; then `wrangler secret put RESEND_API_KEY` (+ set `CONTACT_FROM_EMAIL` / `CONTACT_TO_EMAIL` Worker vars).  
4. Optional: WS6 blog UI (T9); WS7 E2E once Resend is live.

---

## Next Up (resume here)

### Human / ops blockers

1. **Services migrate `--apply`** — dry-run sign-off required; **prod forbidden**. Command lives under `scripts/sanity/migrate-services`.  
2. **WS4b DNS cutover** — operator checklist above.  
3. **Resend domain** — verify subdomain + DMARC before relying on form in prod; set Worker `RESEND_API_KEY` secret.  
4. **GitHub Actions** — Confirm repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` exist for `staging`/`main` deploys (workflow: `.github/workflows/deploy.yml`). Agent cannot set GitHub secrets without auth — operator must confirm in repo Settings → Secrets. Optional Actions **variables**: `NEXT_PUBLIC_*` / analytics tokens per env (see workflow comments).  
5. **WS7** — Expand Playwright for contact form submit (mock or staging with Resend test key).  
6. **WS6 (optional)** — Blog UI (T9).

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

See [`DECISIONS.md`](./DECISIONS.md) (incl. ADR-016/017/018).
