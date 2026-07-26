# Deploy runbook (Phase E stub)

> Stub for Cloudflare OpenNext + R2 + webhooks. Fill real `*.workers.dev` / custom-domain URLs after Wave 3–4 cutover. Secrets are never committed.

## Branch → environment

| Git branch | Cloudflare env | Worker name (Track A) | Deploy command |
| --- | --- | --- | --- |
| `staging` | staging (`wrangler --env staging`) | `kamiyon-studio-website-staging` | `pnpm deploy:staging` |
| `main` | production (default) | `kamiyon-studio-website` | `pnpm deploy:prod` |
| `test` (feature) | — | — | no auto-deploy; merge → `staging` / `main` |

CI: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) on push to `staging` / `main` (also `workflow_dispatch`).

### GitHub secrets (required for Actions)

| Secret | Purpose |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Wrangler / OpenNext deploy auth |
| `CLOUDFLARE_ACCOUNT_ID` | Target Cloudflare account |

### GitHub Actions variables (build-time `NEXT_PUBLIC_*`)

Set per environment as documented in the workflow (e.g. `NEXT_PUBLIC_SITE_URL_STAGING`, `NEXT_PUBLIC_SITE_URL_PRODUCTION`, R2 public base URLs, Sanity project/dataset, CF Web Analytics tokens).

Worker **runtime** secrets (`SANITY_REVALIDATE_SECRET`, `MEDIA_UPLOAD_SECRET`, `SANITY_API_READ_TOKEN`, …) are configured in the Cloudflare dashboard / `wrangler secret put`, not in this repo.

---

## Environment matrix

| Variable | Local | Staging | Production |
| --- | --- | --- | --- |
| `APP_ENV` | `local` | `staging` | `production` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://kamiyon-studio-website-staging.limosnerosherwin.workers.dev` | `https://kamiyonstudio.com` |
| `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` | optional / staging media | `https://media-staging.kamiyonstudio.com` | `https://media.kamiyonstudio.com` |
| `MEDIA_UPLOAD_SECRET` | `.env.local` / `.dev.vars` | Worker secret | Worker secret |
| `SANITY_REVALIDATE_SECRET` | `.env.local` / `.dev.vars` | Worker secret | Worker secret |
| `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` | optional | staging token | prod token |
| `CLOUDFLARE_ACCOUNT_ID` | optional local Wrangler | GitHub secret | GitHub secret |

Also document Sanity: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, optional `SANITY_API_READ_TOKEN`. For **hosted Studio** deploy, also set `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` (static `process.env` only — see ADR-009). Repo defaults: `c6ej1xoj` / `kamiyon`.

---

## Media domains (R2 public CDN)

| Env | Custom domain | R2 bucket (Track F) |
| --- | --- | --- |
| Staging | `media-staging.kamiyonstudio.com` | `kamiyon-media-staging` |
| Production | `media.kamiyonstudio.com` | `kamiyon-media-prod` |

Incremental cache buckets (OpenNext): `kamiyon-next-cache-staging` / `kamiyon-next-cache-prod`.

These names are wired in [`wrangler.jsonc`](../wrangler.jsonc). Track F provisioned all four buckets; media custom domains respond over HTTPS (empty `/` → 404 is expected).

---

## Webhook URLs

Configure in Sanity → API → Webhooks (or HTTP Webhooks API). Auth must match Worker secret `SANITY_REVALIDATE_SECRET`.

| Env | Revalidate endpoint | Auth | Status |
| --- | --- | --- | --- |
| Staging | `https://kamiyon-studio-website-staging.limosnerosherwin.workers.dev/api/revalidate` | Custom header `Authorization: Bearer <SANITY_REVALIDATE_SECRET>` | **Live** (WS4a, 2026-07-24) |
| Production | `https://kamiyonstudio.com/api/revalidate` *(after DNS cutover)* | same pattern | WS4b |

### Staging webhook (configured)

| Field | Value |
| --- | --- |
| Name | `Staging revalidate (Workers)` |
| Hook id | `Dkvgfo2UV4bLXobH` |
| Type | document |
| Dataset | `kamiyon` |
| URL | staging `/api/revalidate` (table above) |
| Trigger | create / update / delete |
| Filter | `_type != null` |
| Projection | `{_type, slug}` |
| Auth | **Custom header** `Authorization: Bearer …` (same value as Worker `SANITY_REVALIDATE_SECRET`) |

**Do not** rely on Sanity’s webhook “Secret” signing field for this endpoint — `/api/revalidate` expects the raw shared secret via Bearer, `x-sanity-revalidate-secret`, or `?secret=` (see `app/api/revalidate/route.ts`).

**Rotate note (WS4a):** Staging Worker `SANITY_REVALIDATE_SECRET` was rotated when the hook was created (old value was not readable from Wrangler). Keep Manage → Webhooks header in sync if you rotate again:

```bash
# PowerShell — put new secret on Worker, then PATCH/recreate hook Authorization header
$secret = "<new>"
$secret | pnpm exec wrangler secret put SANITY_REVALIDATE_SECRET --env staging
```

Payload: Sanity document mutation → `POST /api/revalidate` → `revalidateTag` (`sanity` + type/slug tags from `lib/cms/revalidate-tags.ts`).

Manual create (Manage UI) if recreating:

1. Sanity Manage → project `c6ej1xoj` → API → Webhooks → Create
2. URL = staging revalidate endpoint above; method POST; dataset `kamiyon`
3. Filter `_type != null`; projection `{_type, slug}`; on create/update/delete
4. HTTP headers → `Authorization` = `Bearer <SANITY_REVALIDATE_SECRET>`
5. Leave Sanity “Secret” empty (signature unused by our route)

---

## Manual deploy (escape hatch)

```bash
pnpm deploy:staging   # OpenNext build + wrangler deploy --env staging
pnpm deploy:prod      # OpenNext build + production deploy
```

Requires Wrangler auth (`wrangler login` or `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`).

### Local OpenNext build notes (Wave 2–3)

- `pnpm exec opennextjs-cloudflare build` runs `next build` then bundles for Workers.
- On **Windows without Developer Mode** (no `SeCreateSymbolicLinkPrivilege`), bundling fails with `EPERM: symlink` while recreating pnpm links in `.open-next/`. Workarounds: enable [Windows Developer Mode](https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development), use WSL/Linux CI, or a local junction/copy fallback in `@opennextjs/aws` `copyTracedFiles` (not committed).
- Stop any lingering `workerd` (e.g. prior `preview`) before rebuild — it locks `.open-next/assets` and causes `EPERM` on `rmSync`.
- OpenNext warns Windows is not fully supported; Linux CI remains the durable path.

### Wave 3 staging deploy status (2026-07-24)

- OpenNext **build succeeded** on Windows after junction workaround.
- Cache populate to `kamiyon-next-cache-staging` succeeded.
- **First deploy blocked:** Worker upload ~**5.5 MiB gzip** (embedded Sanity Studio) exceeded Workers **Free 3 MiB**.
- **Mitigation (ADR-007):** Externalize Studio via `pnpm sanity:deploy`. Worker `/studio` is a **config redirect** to hosted Studio (no embedded `NextStudio`).
- **Staging live (Free):** `https://kamiyon-studio-website-staging.limosnerosherwin.workers.dev`
  - Upload size after externalize: ~**2.17 MiB gzip** (under 3 MiB)
  - Secrets present: `MEDIA_UPLOAD_SECRET`, `SANITY_REVALIDATE_SECRET`
  - Runtime workaround: `NEXT_PRIVATE_MINIMAL_MODE=1` (avoids Workers `middleware-manifest` dynamic require 500s)
- Prefer Free tier; do **not** enable Workers Paid solely for Studio size.

### Content seed (`pnpm sanity:seed`)

Idempotent upsert of fallbacks + partners + blog stubs into dataset `kamiyon` (ADR-011). Does not upload media.

```bash
# Requires SANITY_API_WRITE_TOKEN (Editor) in .env.local — never commit
pnpm sanity:seed --dry-run   # plan 42 docs
pnpm sanity:seed             # createOrReplace
```

After seed: open https://kamiyon.sanity.studio/ and upload R2 covers/logos/photos when ready. Flip `isPlaceholder` only when real approved copy replaces stubs.

### Hosted Sanity Studio

```bash
# One-time / when schemas change — requires Sanity login (`pnpm sanity login` if needed)
pnpm sanity:deploy
# Local Studio without the Worker:
pnpm sanity:dev
```

| Item | Value |
| --- | --- |
| Hosted URL | `https://kamiyon.sanity.studio` (override with `SANITY_STUDIO_HOSTNAME` / `NEXT_PUBLIC_SANITY_STUDIO_URL`) |
| Worker path | `/studio` → 307 redirect to hosted URL (`next.config` redirects) |
| Sanity CORS | Add Studio origin + staging/prod site origins in [manage.sanity.io](https://www.sanity.io/manage) → API → CORS origins |
| Upload API | Studio posts to `{SANITY_STUDIO_API_ORIGIN}/api/media/upload` (Worker CORS allowlists Studio origin) |
| Revalidate webhook | Staging hook live — see **Webhook URLs** above |

### Hosted Studio → R2 (staging bake-in)

`SANITY_STUDIO_*` is inlined at `sanity deploy` time (ADR-009). Redeploy whenever origin or upload secret changes:

```bash
# PowerShell — values must match staging Worker
$env:SANITY_STUDIO_API_ORIGIN = "https://kamiyon-studio-website-staging.limosnerosherwin.workers.dev"
$env:SANITY_STUDIO_MEDIA_UPLOAD_SECRET = "<same as Worker MEDIA_UPLOAD_SECRET>"
$env:SANITY_STUDIO_PROJECT_ID = "c6ej1xoj"
$env:SANITY_STUDIO_DATASET = "kamiyon"
pnpm exec sanity deploy -y
```

**WS4a status (2026-07-24):** Redeployed; bundle included `SANITY_STUDIO_API_ORIGIN` + `SANITY_STUDIO_MEDIA_UPLOAD_SECRET`. Studio URL: https://kamiyon.sanity.studio/

**R2 upload smoke (API):** `POST` staging `/api/media/upload` with Bearer `MEDIA_UPLOAD_SECRET` → `200` + object on `https://media-staging.kamiyonstudio.com/...` (CDN GET `200`). Studio UI upload uses the same path after bake-in; hard-refresh Studio if an old chunk is cached.

**CORS:** Staging Worker `OPTIONS /api/media/upload` returns `204` with `Access-Control-Allow-Origin: https://kamiyon.sanity.studio`.

After Wave 4, point `SANITY_STUDIO_API_ORIGIN` at production (`https://kamiyonstudio.com`) and redeploy Studio again (or keep staging origin only if editors should upload to staging R2).

---

## Cutover checklist (Wave 4 — fill in)

- [x] Staging deploy on Free tier (`*.workers.dev`) — pages + `/studio` redirect + API auth smoke
- [x] Hosted Studio live at `https://kamiyon.sanity.studio` (ADR-007/009; user confirmed 2026-07-24)
- [x] Point Sanity webhook at staging revalidate URL (hook `Dkvgfo2UV4bLXobH`; Bearer = Worker secret)
- [x] Redeploy Studio with `SANITY_STUDIO_API_ORIGIN` for R2 uploads; API smoke upload OK
- [ ] Optional: confirm R2 upload from Studio UI (r2Asset input) after hard-refresh
- [ ] Prod Worker smoke on `*.workers.dev`
- [ ] Attach `kamiyonstudio.com` + `www`
- [ ] Point Sanity CORS + webhook URLs at production
- [ ] Set prod `NEXT_PUBLIC_SITE_URL=https://kamiyonstudio.com` at **build** time (public vars are inlined)
- [ ] Pause Vercel (do not delete yet)
