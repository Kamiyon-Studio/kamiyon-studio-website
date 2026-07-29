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

Worker **runtime** secrets (`SANITY_REVALIDATE_SECRET`, `MEDIA_UPLOAD_SECRET`, `SANITY_API_READ_TOKEN`, `RESEND_API_KEY`, …) are configured in the Cloudflare dashboard / `wrangler secret put`, not in this repo.

---

## Environment matrix

| Variable | Local | Staging | Production |
| --- | --- | --- | --- |
| `APP_ENV` | `local` | `staging` | `production` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://kamiyon-studio-website-staging.limosnerosherwin.workers.dev` | `https://kamiyonstudio.com` |
| `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` | optional / staging media | `https://media-staging.kamiyonstudio.com` | `https://media.kamiyonstudio.com` |
| `MEDIA_UPLOAD_SECRET` | `.env.local` / `.dev.vars` | Worker secret | Worker secret |
| `SANITY_REVALIDATE_SECRET` | `.env.local` / `.dev.vars` | Worker secret | Worker secret |
| `RESEND_API_KEY` | `.env.local` (optional) | Worker secret | Worker secret (after domain verify) |
| `CONTACT_TO_EMAIL` | optional (defaults to public Gmail) | Worker var | Worker var |
| `CONTACT_FROM_EMAIL` | `Kamiyon Studio <noreply@send.kamiyonstudio.com>` | Worker var | Worker var (after DKIM/SPF) |
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

## WS4b — Production cutover

> Preflight audit run 2026-07-26 (read-only). Nothing in production was changed. Steps below are ordered; each is tagged **[agent]** (a tool/CI can run it) or **[human]** (needs dashboard / registrar / account access).
>
> **Operator handing the DNS steps to a non-engineer?** [`dns-cutover-guide.md`](./dns-cutover-guide.md) walks the **[human]** steps (TTL, domain attach, `www` redirect, rollback, API-token minting) click by click in plain language.

### Preflight snapshot (verified 2026-07-26)

| Check | Result |
| --- | --- |
| Production Worker `kamiyon-studio-website` | Did not exist at preflight; **created and verified 2026-07-26** — see *Production Worker live* below |
| Production Worker secrets | None at preflight; **both set 2026-07-26** (`MEDIA_UPLOAD_SECRET`, `SANITY_REVALIDATE_SECRET`) |
| R2 buckets | `kamiyon-media-prod`, `kamiyon-next-cache-prod`, `kamiyon-media-staging`, `kamiyon-next-cache-staging` all exist |
| Zone nameservers | `cheryl.ns.cloudflare.com` / `sonny.ns.cloudflare.com` → DNS is edited **in Cloudflare**, not at the registrar |
| Apex `kamiyonstudio.com` today | `A 216.198.79.1`, `A 64.29.17.1` (Vercel, DNS-only) → `308` redirect to `www` |
| `www.kamiyonstudio.com` today | `CNAME a7fb456c57072fcd.vercel-dns-017.com` → `200` (live Vercel site) |
| `media.kamiyonstudio.com` | Cloudflare-proxied, `/` → `404` (expected for an R2 domain) |
| Sanity CORS origins | `http://localhost:3333`, `http://localhost:3000`, `https://kamiyon.sanity.studio`, staging Worker — **production origin missing** |
| Sanity webhooks | Staging revalidate hook only — **no production hook** |
| Sanity media refs | Only one non-R2 URL in the dataset (Eclipse `coverImage.url` = an itch.io *page* URL); `getCmsImageUrl` rejects it and renders the branded placeholder. Prod media bucket is empty until editors upload. |
| Staging Worker build | Older than `test` HEAD — it still renders the pre-allowlist itch.io image. Re-deploy staging before using it as the “known good” reference. |

Canonical direction **flips** at cutover: today apex → `www`; after cutover `www` → apex (code treats the apex as the only canonical host — `lib/seo/site-url.ts`).

### Production Worker live (2026-07-26)

Deployed from branch `test` at commit `03a3e25` (plus the analytics `type="module"` tweak) with `pnpm deploy:prod`-equivalent commands. No domain is attached, so this is a private verification surface until step 6.

| Item | Value |
| --- | --- |
| Worker | `kamiyon-studio-website` (env `production`) |
| Temporary URL | `https://kamiyon-studio-website.limosnerosherwin.workers.dev` |
| Upload size | ~2.17 MiB gzip (under the Workers Free 3 MiB limit) |
| Secrets | `MEDIA_UPLOAD_SECRET`, `SANITY_REVALIDATE_SECRET` — set, and confirmed to survive a redeploy |
| Bindings | `ASSETS`, `WORKER_SELF_REFERENCE` → self, `MEDIA_BUCKET` → `kamiyon-media-prod`, `NEXT_INC_CACHE_R2_BUCKET` → `kamiyon-next-cache-prod` |

Smoke results on the `workers.dev` host:

| Check | Result |
| --- | --- |
| `/` | `200`, `<title>Kamiyon Studio</title>`, no error boundary, no `localhost` references |
| `/portfolio/eclipse` | `200`, title `Eclipse \| Kamiyon Studio`, canonical `https://kamiyonstudio.com/portfolio/eclipse` |
| `/studio` | `307` → `https://kamiyon.sanity.studio/` |
| `/opengraph-image-4usi79` | `200 image/png` (~20 KB); home `og:image` points at the same hashed path on the apex |
| `/robots.txt` | `Allow: /`, `Host: kamiyonstudio.com`, `Sitemap: https://kamiyonstudio.com/sitemap.xml` — no `Disallow: /`, no `localhost`, no `workers.dev` |
| `/api/revalidate` (no token / bad token) | `401` both — not `503`, so the Worker secret is live |
| `/api/media/upload` (no token) | `401` |
| `media.kamiyonstudio.com` | Test object `PUT` to `kamiyon-media-prod` served `200 image/png` over the CDN, and through `/_next/image` (allowlist OK); object deleted afterwards |
| Analytics beacon | Absent, as expected — `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` is still empty (T14 token is a build var) |
| `workers.dev` crawlability | Crawlable (`robots.txt` says `Allow: /`). Fine now; it becomes a duplicate origin once the apex is live — step 9 |

Two operational gotchas found while deploying:

- **Secrets before the first deploy do not stick.** `wrangler secret put` against a Worker that does not exist yet silently creates a placeholder Worker; the first real `opennextjs-cloudflare deploy` replaces it and drops those secrets (`/api/revalidate` then returns `503`). Deploy first, then `secret put`, then re-check for `401`. Secrets set on an existing Worker do survive later deploys.
- **`populate-cache` can 503.** Writing the incremental cache to `kamiyon-next-cache-prod` failed with repeated `503 Service Unavailable` at the default concurrency and aborted the deploy before upload. `pnpm exec opennextjs-cloudflare deploy --env production --cacheChunkSize 5` completed. Also note the `workers.dev` hostname can resolve to a Cloudflare range some ISPs cannot reach; `curl --resolve <host>:443:<ip>` with an address from `Resolve-DnsName` is a quick way to tell a local network problem from a broken deploy.

### Build-time vs runtime env (read before deploying)

`NEXT_PUBLIC_*` is inlined by `next build`, and `robots.txt` + `sitemap.xml` are **prerendered**. A production build without `NEXT_PUBLIC_SITE_URL=https://kamiyonstudio.com` and `APP_ENV=production` ships `Disallow: /` plus `localhost` canonicals — the Worker `vars` in `wrangler.jsonc` cannot fix that after the fact. `.github/workflows/deploy.yml` now defaults these values so a missing repo variable cannot silently produce a noindex production site.

| Name | Where it must be set for production |
| --- | --- |
| `APP_ENV`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_STUDIO_URL`, `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` | **Build** env (GitHub Actions vars / local shell) — also declared in `wrangler.jsonc` `env.production.vars` for runtime reads |
| `NEXT_PRIVATE_MINIMAL_MODE=1` | `wrangler.jsonc` vars (runtime) — required or Workers 500s |
| `SANITY_REVALIDATE_SECRET`, `MEDIA_UPLOAD_SECRET` | `wrangler secret put … --env production` (never in config, never printed) |
| `SANITY_API_READ_TOKEN` | Not required — dataset `kamiyon` reads publicly; add only if the dataset becomes private |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | GitHub repo secrets (Actions) |

Bindings are identical to staging except the bucket names: `ASSETS`, `WORKER_SELF_REFERENCE` → `kamiyon-studio-website`, `MEDIA_BUCKET` → `kamiyon-media-prod`, `NEXT_INC_CACHE_R2_BUCKET` → `kamiyon-next-cache-prod`. No KV/D1/Queues are used.

### Gaps that must close before DNS is touched

- [x] Production Worker deployed and green on `https://kamiyon-studio-website.limosnerosherwin.workers.dev` (2026-07-26)
- [x] Prod Worker secrets `SANITY_REVALIDATE_SECRET` + `MEDIA_UPLOAD_SECRET` set (2026-07-26; both endpoints answer `401`, not `503`)
- [ ] GitHub secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` confirmed (Actions deploys `main` → production)
- [ ] Sanity CORS includes `https://kamiyonstudio.com` (+ `www` if it will be attached)
- [ ] Production revalidate webhook created with `Authorization: Bearer <prod SANITY_REVALIDATE_SECRET>`
- [ ] Cloudflare Web Analytics token for the apex created and set as a **build** variable (T14) — otherwise the beacon silently no-ops
- [ ] Old apex/`www` Vercel DNS values recorded for rollback (see snapshot table)
- [ ] Decide `www` strategy (attach to Worker vs Redirect Rule) — step 6

**Known non-blocking gap:** `buildPageMetadata` no longer emits a hardcoded `/opengraph-image` (that path 404s — the generated route is served as `/opengraph-image-<build hash>`). The home page gets the hashed image automatically; inner routes ship `og:title`/`og:description` with no image until they have a CMS `seo.ogImage` or a stable OG endpoint is added. A dynamic OG route would pull `next/og` back into the Worker bundle, so weigh it against the 3 MiB Free limit (ADR-007).

### Steps

**1. [agent] Verify the build that will ship.** Session env must not leak into tests (`NEXT_PUBLIC_SITE_URL` in the shell breaks `lib/seo/site-url.test.ts`).

```powershell
pnpm install --frozen-lockfile
pnpm lint
pnpm test
```

**2. [agent] Refresh staging from `test` first** so the “known good” reference matches the code being promoted: merge `test` → `staging`, let Actions deploy, re-smoke staging.

**3. [agent/CI] Deploy the production Worker.** Preferred path is CI (Linux avoids the Windows symlink issue): merge `staging` → `main`, then watch **Actions → Deploy (production)**. Manual escape hatch:

```powershell
$env:APP_ENV = "production"
$env:NEXT_PUBLIC_SITE_URL = "https://kamiyonstudio.com"
$env:NEXT_PUBLIC_R2_PUBLIC_BASE_URL = "https://media.kamiyonstudio.com"
$env:NEXT_PUBLIC_SANITY_PROJECT_ID = "c6ej1xoj"
$env:NEXT_PUBLIC_SANITY_DATASET = "kamiyon"
$env:NEXT_PUBLIC_SANITY_STUDIO_URL = "https://kamiyon.sanity.studio"
pnpm deploy:prod
```

Confirm the upload stays under the Workers Free **3 MiB** gzip limit (staging was ~2.17 MiB). If the run dies in *Populating remote R2 incremental cache* with repeated `503`s, re-run the deploy half only, at lower concurrency: `pnpm exec opennextjs-cloudflare deploy --env production --cacheChunkSize 5`.

**4. [human/agent] Set production Worker secrets** — **after** step 3, never before: `secret put` against a missing Worker creates a placeholder that the first real deploy overwrites, taking the secrets with it. Each `put` creates a new version, so no redeploy is needed. Values come from the operator; never echo them into logs or docs.

```powershell
pnpm exec wrangler secret put SANITY_REVALIDATE_SECRET --env production
pnpm exec wrangler secret put MEDIA_UPLOAD_SECRET --env production
pnpm exec wrangler secret list --env production   # names only
```

**5. [agent] Smoke the Worker on `workers.dev` before any DNS change.**

```powershell
$b = "https://kamiyon-studio-website.limosnerosherwin.workers.dev"
foreach ($p in @("/", "/portfolio/eclipse", "/studio", "/robots.txt", "/sitemap.xml")) {
  $o = curl.exe -s -o NUL -w "%{http_code} %{redirect_url}" --max-time 25 "$b$p"; "$o  <- $p"
}
curl.exe -s "$b/robots.txt"                       # expect Allow: / + Host: kamiyonstudio.com
curl.exe -s -o NUL -w "%{http_code}`n" -X POST "$b/api/revalidate"  # expect 401 (no token)
```

Expect `200` for pages, `307` → `https://kamiyon.sanity.studio/` for `/studio`, `401` for an unauthenticated revalidate. `robots.txt` saying `Allow: /` on the `workers.dev` host is correct (it is baked from the build env) — see step 9 about closing that duplicate origin.

**6. [human] Attach the custom domains.** Cloudflare dashboard → **Workers & Pages → kamiyon-studio-website → Settings → Domains & Routes → Add → Custom domain**. Add `kamiyonstudio.com`, accept the prompt to **replace** the existing Vercel `A` records, then repeat for `www.kamiyonstudio.com`. Wait for the certificate to go active (usually < 1 min).

- **TTL:** at least 1 hour beforehand, set the apex `A` records and the `www` `CNAME` to TTL `60` so resolvers drop the Vercel answers quickly. Cloudflare-managed Worker records are proxied and take effect immediately at the edge.
- **Canonical hygiene:** the site canonicalises to the apex, so after both hosts resolve, add a **Redirect Rule** (Rules → Redirect Rules) `www.kamiyonstudio.com/*` → `https://kamiyonstudio.com/$1`, 301. Alternative: do not attach `www` at all and point it at a proxied placeholder used only by the rule.
- CLI alternative (`routes` + `custom_domain: true` in `wrangler.jsonc`) needs an API token with **Zone → DNS → Edit**; the current OAuth login only has `zone (read)`, so the dashboard is the reliable path.

**7. [human] Repoint Sanity at production.**

- **Manage → API → CORS origins:** add `https://kamiyonstudio.com` (and `www` if attached). CLI equivalent, if preferred: `pnpm exec sanity cors add https://kamiyonstudio.com --credentials`.
- **Manage → API → Webhooks:** create `Production revalidate (Workers)` → `https://kamiyonstudio.com/api/revalidate`, POST, dataset `kamiyon`, filter `_type != null`, projection `{_type, slug}`, header `Authorization: Bearer <prod SANITY_REVALIDATE_SECRET>`. Leave Sanity’s “Secret” field empty. Keep the staging hook as-is.
- **Studio → prod uploads:** re-bake and redeploy the Studio so editor uploads land in `kamiyon-media-prod`:

```powershell
$env:SANITY_STUDIO_API_ORIGIN = "https://kamiyonstudio.com"
$env:SANITY_STUDIO_MEDIA_UPLOAD_SECRET = "<same as prod Worker MEDIA_UPLOAD_SECRET>"
$env:SANITY_STUDIO_PROJECT_ID = "c6ej1xoj"
$env:SANITY_STUDIO_DATASET = "kamiyon"
pnpm exec sanity deploy -y
```

**8. [agent] Post-cutover smoke checks.**

```powershell
$b = "https://kamiyonstudio.com"
foreach ($p in @("/", "/about", "/portfolio/eclipse", "/studio", "/robots.txt", "/sitemap.xml")) {
  $o = curl.exe -s -o NUL -w "%{http_code} %{redirect_url}" --max-time 25 "$b$p"; "$o  <- $p"
}
curl.exe -s -o NUL -w "%{http_code}`n" "https://www.kamiyonstudio.com/"            # 301 → apex (or 200 if www is attached without a rule)
curl.exe -s "$b/" | Select-String -Pattern 'og:image|rel="canonical"'              # hashed /opengraph-image-<hash>, apex canonical
curl.exe -s -o NUL -w "%{http_code}`n" "$b/opengraph-image-4usi79"                 # 200 image/png (hash changes per build)
curl.exe -s -o NUL -w "%{http_code}`n" -X POST "$b/api/revalidate"                 # 401
curl.exe -s -o NUL -w "%{http_code}`n" -X POST -H "Authorization: Bearer wrong" "$b/api/revalidate"  # 401
curl.exe -s -o NUL -w "%{http_code}`n" "https://media.kamiyonstudio.com/<known-object-key>"          # 200 once media is uploaded
```

Also confirm by eye: home renders CMS content (not only fallbacks), `/studio` lands on the hosted Studio, publishing in Studio updates the site without a deploy, and the Cloudflare Web Analytics beacon appears in the HTML once the token is set.

**9. [human] Close the duplicate origin and the old host.**

- Set `workers_dev: false` on `env.production` in `wrangler.jsonc` and redeploy, so the crawlable `*.workers.dev` copy of production goes away.
- **Vercel:** only after 24–48 h green — Vercel dashboard → project → Settings → **remove the `kamiyonstudio.com` / `www` domains** and disable production deploys (or pause the project). **Do not delete the project**; it is the rollback target.

### Rollback (apex broken)

1. **[human] Cloudflare → DNS:** delete the Worker-managed apex and `www` records, then restore the Vercel values (TTL 60, **DNS only / grey cloud**):

| Name | Type | Value |
| --- | --- | --- |
| `kamiyonstudio.com` | A | `216.198.79.1` |
| `kamiyonstudio.com` | A | `64.29.17.1` |
| `www` | CNAME | `a7fb456c57072fcd.vercel-dns-017.com` |

2. **[human]** Remove the custom domains from the Worker (Settings → Domains & Routes) and disable any `www` Redirect Rule.
3. **[human]** Confirm the Vercel project still has the domains attached and is serving; verify `curl -sI https://www.kamiyonstudio.com/` → `200`.
4. **[agent]** Roll the Worker itself back instead, if the failure is code-level rather than DNS: `pnpm exec wrangler deployments list --env production` then `pnpm exec wrangler rollback [version-id] --env production`.
5. **[human]** Leave the Sanity production webhook in place (harmless) and re-point `SANITY_STUDIO_API_ORIGIN` back to staging if editors need uploads during the rollback window.

### Cutover checklist

- [x] Staging deploy on Free tier (`*.workers.dev`) — pages + `/studio` redirect + API auth smoke
- [x] Hosted Studio live at `https://kamiyon.sanity.studio` (ADR-007/009; user confirmed 2026-07-24)
- [x] Point Sanity webhook at staging revalidate URL (hook `Dkvgfo2UV4bLXobH`; Bearer = Worker secret)
- [x] Redeploy Studio with `SANITY_STUDIO_API_ORIGIN` for R2 uploads; API smoke upload OK
- [x] WS4b preflight audit (2026-07-26) — inventory, gap list, ordered runbook above
- [ ] Optional: confirm R2 upload from Studio UI (r2Asset input) after hard-refresh
- [ ] Refresh staging from `test`
- [x] Deploy prod Worker; secrets set; smoke on `*.workers.dev` (2026-07-26 — see *Production Worker live*)
- [ ] Attach `kamiyonstudio.com` + `www`
- [ ] Point Sanity CORS + webhook URLs at production
- [ ] Set prod `NEXT_PUBLIC_SITE_URL=https://kamiyonstudio.com` at **build** time (public vars are inlined)
- [ ] `workers_dev: false` on production after DNS is live
- [ ] Pause Vercel (do not delete yet)
