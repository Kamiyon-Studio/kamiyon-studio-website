# Analytics Setup — Cloudflare Web Analytics (T14)

> **Who this is for:** the site operator. No coding needed — you only copy a value
> from one dashboard and paste it into another.
>
> **What it does:** counts visitors and page speed, privacy-first. No cookies, no
> Google Analytics (locked in [`WEBSITE-ESSENTIAL-CONTEXT.md`](./WEBSITE-ESSENTIAL-CONTEXT.md) §3).
>
> Related: [`DECISIONS.md`](./DECISIONS.md) ADR-012 · env var reference in `.env.example`

---

## What is already done in the code

The site already contains the analytics snippet. It stays switched **off** until a
token is provided, and it never runs on a developer's machine. Nothing needs to be
edited in the code to turn it on.

| Situation | What the site does |
| --- | --- |
| No token set | Renders nothing. No errors, no console messages. |
| Local development (`pnpm dev`) | Renders nothing, even if a token is set. |
| Staging / production with a token | Loads the Cloudflare beacon after the page is interactive. |

---

## Part 1 — Create the site in Cloudflare and copy the token

Do this **twice**: once for the staging address and once for `kamiyonstudio.com`.
Each one gives you a different token.

1. Open <https://dash.cloudflare.com/> and log in.
2. Click the **account selector** at the top, then choose **Account Home**.
3. In the left sidebar, click **Analytics & Logs**, then click **Web Analytics**.
4. Click **Add a site** (the button may read **Add a site** or **Manage site**).
5. In the **hostname** box, type the address you want to measure:
   - For staging: `kamiyon-studio-website-staging.limosnerosherwin.workers.dev`
   - For production: `kamiyonstudio.com`
6. Click **Next**.
7. Cloudflare shows a box titled **Copy JS Snippet**. Click **Click to copy**.
8. Paste what you copied into a plain text note. It looks like this:

   ```html
   <script defer src='https://static.cloudflareinsights.com/beacon.min.js'
     data-cf-beacon='{"token": "abc123def456abc123def456abc12345"}'></script>
   ```

9. **You only need the long value inside the quotes after `"token":`** — in the
   example above that is `abc123def456abc123def456abc12345`. That value is the
   "site token". Copy just that. Do not include the quotes or any `<script>` text.

> **Important:** if Cloudflare offers a toggle to **automatically add the snippet**
> for you, leave it **OFF**. The site already adds the snippet itself, and
> Cloudflare only counts one snippet per page — two would conflict.

> **Is the token secret?** No. It is visible to anyone who views the page source.
> It is still stored as a configuration value so each environment can differ.

---

## Part 2 — Give the token to the site

The token has to be present **when the site is built**, not just when it runs. The
easiest and supported way is a GitHub repository variable — the deploy workflow
already reads it.

1. Open the repository on GitHub.
2. Click **Settings** (top tab bar of the repository).
3. In the left sidebar, click **Secrets and variables**, then click **Actions**.
4. Click the **Variables** tab (not "Secrets").
5. Click **New repository variable**.
6. For the staging token:
   - **Name:** `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN_STAGING`
   - **Value:** paste the staging token from Part 1
   - Click **Add variable**
7. Click **New repository variable** again. For the production token:
   - **Name:** `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN_PRODUCTION`
   - **Value:** paste the production token from Part 1
   - Click **Add variable**
8. Re-run the deploy workflow (or push to the branch that deploys). Analytics
   starts counting from that deployment onward.

### If someone deploys from their own computer instead

The deploy scripts (`pnpm deploy:staging` / `pnpm deploy:prod`) build on the
machine they run on, so the token has to be in that machine's `.env.local`:

```bash
# .env.local  (never committed)
NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN=abc123def456abc123def456abc12345
```

Then deploy as usual:

```bash
pnpm deploy:staging   # or: pnpm deploy:prod
```

### The `wrangler.jsonc` entry

`wrangler.jsonc` carries an empty `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` slot for
both the `staging` and `production` environments. It is intentionally blank — it
documents the variable and lets the Worker carry the value, but **it does not
replace Part 2**, because public variables are baked into the page during the
build. Filling it in without also setting the build variable will not turn
analytics on.

---

## Part 3 — Check that it worked

1. Wait for the deploy to finish, then open the site in a normal browser tab.
2. Click around two or three pages.
3. Go back to **Cloudflare dashboard → Analytics & Logs → Web Analytics** and pick
   your site. Visits usually appear within a few minutes.

If nothing appears after ~15 minutes:

- Confirm the hostname you typed in Part 1 matches the address you actually visited.
- Confirm the variable name in Part 2 is spelled exactly as written above.
- Confirm the deploy ran **after** you added the variable.
- Ad blockers and privacy browsers can block the beacon; try another browser.

---

## Notes for developers

- Env var: `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` (public, build-time inlined).
- Resolution logic: `lib/analytics/cloudflare-web-analytics.ts` (pure, unit-tested).
- Rendering: `components/analytics/CloudflareWebAnalytics.tsx`, mounted once in
  `app/(frontend)/layout.tsx` via `next/script` with `strategy="afterInteractive"`
  so it never competes with LCP (budgets: essential context §11).
- Off switch is `resolveCloudflareBeacon` returning `null` — blank token, or
  `APP_ENV=local` / `NODE_ENV=development`.
- `spa: true` is set so App Router client-side navigations report as page views.
- **CSP:** the repo currently ships **no** `Content-Security-Policy` (no
  `headers()` in `next.config.ts`, no middleware, and `public/_headers` only sets
  cache headers), so no CSP change was required. If a CSP is added later, the
  manually embedded beacon needs:

  ```plaintext
  script-src  … https://static.cloudflareinsights.com/beacon.min.js
  connect-src … cloudflareinsights.com
  ```
