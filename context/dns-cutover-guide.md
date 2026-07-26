# DNS Cutover Guide — pointing kamiyonstudio.com at the new site (WS4b)

> **Who this is for:** the site operator. No coding needed. Every step here is done by
> clicking in a website dashboard.
>
> **What it does:** moves `kamiyonstudio.com` from its current host (Vercel) to the new
> Cloudflare Worker, without losing the site or the domain.
>
> **Engineer reference:** [`deploy-runbook.md`](./deploy-runbook.md) — “WS4b — Production
> cutover”. That document has the same steps in technical form, plus the parts an agent
> runs. This guide covers only the parts a human must do by hand.

---

## Words you need first

| Term | In plain language |
| --- | --- |
| DNS | The internet's phone book. It turns a name people type (`kamiyonstudio.com`) into the address of the computer that answers. |
| DNS record | One line in that phone book. An **A** record points a name at a numeric server address. A **CNAME** record points a name at *another name*. |
| Apex | The bare domain with nothing in front: `kamiyonstudio.com`. Sometimes shown as `@` in dashboards. |
| `www` | A separate name, `www.kamiyonstudio.com`. It has its own record and must be handled separately from the apex. |
| TTL | “Time to live”: how long other computers are allowed to remember an answer before asking again. A TTL of 1 day means the world can keep showing the old site for a day after you change it. |
| Propagation | The waiting period while computers around the world forget the old answer and pick up the new one. You cannot speed it up once it starts — you can only prepare for it by lowering TTL beforehand. |
| Proxied vs DNS only | In Cloudflare, an orange cloud (**Proxied**) means traffic passes through Cloudflare; a grey cloud (**DNS only**) means it goes straight to the other host. The current Vercel records are **DNS only**. |
| Worker | The new website. It already runs on Cloudflare; it just does not yet answer at `kamiyonstudio.com`. |
| Custom domain | Telling Cloudflare “serve that Worker at this address.” Cloudflare writes the DNS record for you when you do this. |

**Two things you must not touch.** Leave `MX` and `TXT` records alone — those carry email
and domain verification, and nothing in this guide affects email. Also leave
`media.kamiyonstudio.com` alone; that is where the site's images are served from and it is
already correct.

---

## Before you start

1. You need logins for: **Cloudflare** (the account that holds `kamiyonstudio.com`),
   **Vercel** (the current host), and **GitHub**. Sanity is not needed for the DNS part.
2. Someone technical must first create the new production Worker and confirm it works at
   its temporary address:
   <https://kamiyon-studio-website.limosnerosherwin.workers.dev>
3. **That Worker now exists and was checked on 2026-07-26**: the home page, project pages,
   the `/studio` redirect and the image and content plumbing all responded correctly at the
   temporary address. Step 4 is your own confirmation of the same thing on the day.
4. Set aside a quiet window. The switch itself takes about ten minutes, but the schedule
   below includes deliberate waiting periods.

---

## Timeline at a glance

| When | What happens | Can you undo it? |
| --- | --- | --- |
| Any time | Steps 1–3: record what exists today, lower TTL | Yes, harmless |
| Wait **at least 1 hour** after step 3 | Lets the world forget the old, long-lived answers | — |
| Cutover window | Steps 4–7: attach the domain to the Worker, add the `www` redirect | Yes — see **If the site is down** |
| Right after | Step 8: check the site in a browser | — |
| Then | Step 9: hand back to the developer for Sanity and analytics settings | Yes |
| Wait **24–48 hours** of everything working | Step 10: remove the domains from Vercel | Hard to undo quickly — do not rush this |

---

## Steps

### 1. Open the domain in Cloudflare

Go to <https://dash.cloudflare.com/> and log in. On the **Websites** list, click
**kamiyonstudio.com**. In the left sidebar click **DNS**, then **Records**.

**You should see:** a table of records including two `A` records named `kamiyonstudio.com`
and one `CNAME` named `www`.

**Risk:** none. You are only looking.

### 2. Save a copy of what exists today

Take a screenshot of the whole records table, or copy it into a note. This is your safety
net, and it is the fastest way to undo anything later.

For reference, these are the values recorded on 2026-07-26:

| Name | Type | Value | Proxy |
| --- | --- | --- | --- |
| `kamiyonstudio.com` | A | `216.198.79.1` | DNS only |
| `kamiyonstudio.com` | A | `64.29.17.1` | DNS only |
| `www` | CNAME | `a7fb456c57072fcd.vercel-dns-017.com` | DNS only |

**Risk:** none.

### 3. Lower the TTL on those three records, then wait an hour

For each of the three records above:

1. Click **Edit** at the right of the row.
2. Find the **TTL** dropdown and choose **1 min** (or the smallest value offered).
3. Click **Save**.

**You should see:** the TTL column now reads `1 min` instead of `Auto` or a longer time.

Now **wait at least one hour** before step 5. This does not change the website at all — it
only shortens how long the rest of the internet is allowed to remember the old answer, so
that when you do switch, visitors move over in about a minute instead of hours.

**Risk:** very low, and fully reversible (set the TTL back). The site keeps working
normally during the wait.

### 4. Confirm the new site works at its temporary address

Open <https://kamiyon-studio-website.limosnerosherwin.workers.dev> in a browser.

**You should see:** the Kamiyon Studio home page, and clicking into a portfolio project
should open that project's page.

**If you do not see that, stop here** and tell the developer. Attaching the domain to a
broken Worker is what takes the live site down.

One harmless exception: if the page never loads at all — a spinner and then a timeout,
rather than an error message from the site — try again on a different network, such as a
phone on mobile data. That address was confirmed working on 2026-07-26, and some home
internet connections cannot reach the particular Cloudflare address it hands out. A timeout
on one network only is a network problem, not a broken site; anything else (an error page,
a blank page, missing content) is a real stop.

**Risk:** none. This is the go/no-go check.

### 5. Attach `kamiyonstudio.com` to the Worker (this is the switch)

1. In Cloudflare, click the account name at the top to leave the domain view, then in the
   left sidebar click **Compute (Workers)** and then **Workers & Pages**.
2. Click the Worker named **kamiyon-studio-website** (not the one ending in `-staging`).
3. Open the **Settings** tab, find the **Domains & Routes** section, and click **Add**,
   then **Custom domain**.
4. Type `kamiyonstudio.com` and confirm.
5. Cloudflare will warn that a DNS record already exists for that name and offer to
   **replace** or **override** it. Accept that. This is the Vercel record being swapped
   for the new one.

**You should see:** `kamiyonstudio.com` listed under Domains & Routes, first as
**Initializing** or **Pending**, then as **Active**. This usually takes under a minute and
occasionally up to fifteen while a security certificate is issued.

**Risk:** this is the real change. Visitors start reaching the new site within about a
minute. It is reversible — see **If the site is down** below.

### 6. Attach `www.kamiyonstudio.com` the same way

Repeat step 5 exactly, but type `www.kamiyonstudio.com`. Accept the replace prompt again.

**You should see:** both `kamiyonstudio.com` and `www.kamiyonstudio.com` listed as
**Active**.

**Risk:** same as step 5, and reversible the same way.

### 7. Send `www` visitors to the plain address

The site is designed so that `kamiyonstudio.com` is the single official address. This step
makes `www` forward to it, so search engines do not treat the two as separate sites.

1. Go back to the **kamiyonstudio.com** domain (Cloudflare **Websites** list).
2. In the left sidebar click **Rules**, then **Redirect Rules** (on some accounts:
   **Rules → Overview → Create rule → Redirect rule**).
3. Click **Create rule** and name it `www to apex`.
4. For the condition, choose **Hostname** **equals** `www.kamiyonstudio.com`.
5. For the action, choose a **Dynamic** redirect with:
   - **Expression:** `concat("https://kamiyonstudio.com", http.request.uri.path)`
   - **Status code:** `301`
   - **Preserve query string:** on
6. Click **Deploy**.

**You should see:** typing `www.kamiyonstudio.com` in a browser lands on
`kamiyonstudio.com` with the `www` gone from the address bar.

**Risk:** low, and reversible — you can disable or delete the rule and `www` simply serves
the site directly again. If the expression box gives you trouble, skip this step and tell
the developer; the site still works correctly without it.

### 8. Check it worked

See **How do I check it worked** below and go through the whole list.

### 9. Hand back for the remaining settings

Tell the developer that DNS is live. They still need to point Sanity's publish-notification
and permissions at the new address, re-publish the editing Studio so image uploads go to
the production storage, and switch on analytics. Those are not DNS and are listed in
[`deploy-runbook.md`](./deploy-runbook.md).

### 10. Only after 24–48 hours of everything working: remove the domains from Vercel

Do not do this on cutover day. Vercel is your parachute until you are confident.

1. Go to <https://vercel.com/> and open the Kamiyon Studio project.
2. Click **Settings**, then **Domains**.
3. Remove `kamiyonstudio.com` and `www.kamiyonstudio.com` from the project.
4. Optionally pause the project.

**Do not delete the Vercel project.** Keeping it means you can go back if something
surfaces weeks later.

---

## How do I check it worked

Use a browser and, ideally, also your phone on mobile data — phones and home computers
cache old answers differently, so agreement between the two is a good sign.

| Visit this | A healthy result looks like |
| --- | --- |
| `https://kamiyonstudio.com` | The Kamiyon Studio home page loads, with a padlock in the address bar and no certificate warning. |
| `https://www.kamiyonstudio.com` | You end up on `https://kamiyonstudio.com` — the `www` disappears from the address bar. (If you skipped step 7, the page simply loads with `www` still showing. That is acceptable.) |
| Any portfolio project page | Opens normally with its text and images. |
| `https://kamiyonstudio.com/studio` | Redirects to `https://kamiyon.sanity.studio` — the content editing tool. |
| `https://kamiyonstudio.com/robots.txt` | A short plain-text page whose first lines read `User-Agent: *` and `Allow: /`. If instead it says `Disallow: /`, the site was built with the wrong settings and search engines are being told to ignore it — tell the developer, do not roll back DNS for this. |
| `https://kamiyonstudio.com/sitemap.xml` | A page full of `kamiyonstudio.com` links (it will look like raw code — that is normal). |

**If a page looks like the old site,** your own browser is probably remembering it. Try a
private/incognito window, a different browser, or your phone on mobile data before
assuming something is wrong.

---

## If the site is down — rollback

Work through this in order. Steps 1 and 2 put the old site back; expect visitors to return
to normal within a few minutes because you lowered the TTL in step 3.

1. **Put the old records back.** Cloudflare → **Websites** → `kamiyonstudio.com` → **DNS**
   → **Records**. Delete the records Cloudflare created for the Worker, then click **Add
   record** and re-create these exactly, each with TTL **1 min** and the cloud set to
   **DNS only** (grey, not orange):

   | Name | Type | Value |
   | --- | --- | --- |
   | `kamiyonstudio.com` | A | `216.198.79.1` |
   | `kamiyonstudio.com` | A | `64.29.17.1` |
   | `www` | CNAME | `a7fb456c57072fcd.vercel-dns-017.com` |

2. **Detach the domains from the Worker.** Cloudflare → **Compute (Workers)** → **Workers
   & Pages** → **kamiyon-studio-website** → **Settings** → **Domains & Routes** → remove
   `kamiyonstudio.com` and `www.kamiyonstudio.com`. Also disable the `www to apex` redirect
   rule from step 7 if you created it.

3. **Confirm the old site is back.** In a private browser window, open
   `https://www.kamiyonstudio.com`. You should see the previous website.

4. **Tell the developer what you saw** — the exact address, and what appeared (blank page,
   error message, certificate warning). They can also roll the Worker itself back to an
   earlier version without touching DNS, which is often the better fix.

This rollback only works while the Vercel project still has the domains attached, which is
why step 10 waits 24–48 hours.

---

## If you would rather an agent did the domain attach for you

Steps 5 and 6 can be automated, but only with a Cloudflare access token that is allowed to
*change* DNS. The login currently used by the tooling can only **read** DNS, which is why
those steps are in this guide instead of being scripted.

To create such a token:

1. Go to <https://dash.cloudflare.com/profile/api-tokens> (or: click the profile icon at
   the top right → **My Profile** → **API Tokens**).
2. Click **Create Token**, then **Create Custom Token** → **Get started**.
3. Give it a name such as `kamiyon-dns-cutover`.
4. Under **Permissions**, add three rows:
   - **Account** → **Workers Scripts** → **Edit**
   - **Zone** → **DNS** → **Edit**
   - **Zone** → **Workers Routes** → **Edit**
5. Under **Zone Resources**, choose **Include** → **Specific zone** → `kamiyonstudio.com`.
6. Click **Continue to summary**, then **Create Token**.
7. Cloudflare shows the token **once**. Copy it now.

**A token is the same as a password.** Anyone holding it can change your DNS. Paste it
directly into the terminal or secret store when asked for it, never into a chat message,
a document, or any file inside this repository. When the cutover is done, come back to the
same page and click **Delete** on the token.

With that token in hand, an agent can attach both domains and verify the result, and you
would only need steps 1–4, 8 and 10 from this guide.

---

## Notes for developers

- Technical sequence, smoke commands, and the Worker-level rollback: [`deploy-runbook.md`](./deploy-runbook.md) “WS4b — Production cutover”.
- The production Worker is deployed and its `SANITY_REVALIDATE_SECRET` / `MEDIA_UPLOAD_SECRET`
  are already set (verified 2026-07-26), so no secret work is needed on cutover day — only
  the Sanity webhook header and the Studio re-bake must reuse the same values.
- Status and ownership: [`progress-tracker.md`](./progress-tracker.md) (WS4b).
- The canonical host is the apex only (`lib/seo/site-url.ts`); `robots.txt` and
  `sitemap.xml` are prerendered, so a build without `NEXT_PUBLIC_SITE_URL` and
  `APP_ENV=production` ships `Disallow: /` regardless of DNS.
- After DNS is live, set `workers_dev: false` on the production environment so the
  `*.workers.dev` copy stops being a crawlable duplicate.
