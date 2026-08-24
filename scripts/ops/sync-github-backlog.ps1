<#
.SYNOPSIS
  Sync ADR-030 / operator backlog on GitHub Issues (Kanban source).

.DESCRIPTION
  Run after: gh auth login -h github.com -s "repo,project,read:org,workflow"
  Closes issues fixed by ADR-030 and creates operator-manual backlog items.

  Usage:
    powershell -File scripts/ops/sync-github-backlog.ps1
#>

$ErrorActionPreference = "Stop"
$Owner = "Kamiyon-Studio"
$Repo = "kamiyon-studio-website"

function Assert-GhAuth {
  gh auth status -h github.com 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Not logged in. Run: gh auth login -h github.com -s `"repo,project,read:org,workflow`""
  }
}

function Close-FixedIssue {
  param(
    [int]$Number,
    [string]$Comment
  )
  Write-Host "Closing #$Number..."
  gh issue comment $Number --repo "$Owner/$Repo" --body $Comment
  gh issue close $Number --repo "$Owner/$Repo" --reason completed
}

function New-BacklogIssue {
  param(
    [string]$Title,
    [string]$Body,
    [string[]]$Labels = @("enhancement")
  )
  $labelArgs = @()
  foreach ($label in $Labels) {
    $labelArgs += @("--label", $label)
  }
  Write-Host "Creating: $Title"
  gh issue create --repo "$Owner/$Repo" --title $Title --body $Body @labelArgs
}

Assert-GhAuth

# --- Close ADR-030 fixed issues ---
Close-FixedIssue -Number 21 -Comment @"
## Closed by ADR-030 (Sanity ↔ frontend align)

Home is no longer a block renderer. Studio Home uses named fields in frontend order: **Partners → Portfolio → Awards → Services → Contact CTA → SEO**.

- Commit: ``930b386``
- ADR: ADR-030
- Studio: https://kamiyon.sanity.studio/

**Operator follow-up:** ``pnpm sanity:seed`` (or fill Home refs manually) so the dataset matches the new schema.
"@

Close-FixedIssue -Number 22 -Comment @"
## Closed by ADR-030 / WhoWeAreBand

About now shows Mission / Vision / Motto / Values / Culture / Team intro in a **WHO WE ARE** band between Our Story and Timeline.

- Commit: ``930b386``
- ADR: ADR-030 (supersedes ADR-027 “do not show on /about”)
- Vision stays labeled **Vision**

Archived VisionBand / ValuesGrid / CultureClosing were not restored.
"@

Close-FixedIssue -Number 30 -Comment @"
## Closed by ADR-030

Home has an **Awards** reference array on ``homePage`` (unbounded). Award docs include title, organization, label, year, order, placeholder toggle, and CMS ``placeholderLabel``.

- Commit: ``930b386``
- Studio: https://kamiyon.sanity.studio/
"@

# --- Operator / manual backlog (agents cannot finish) ---
New-BacklogIssue -Title "ops: re-seed Sanity Home named refs after ADR-030" -Body @"
## Operator / manual

Schema + Studio are live (ADR-030 / ``930b386``). Dataset may still lack Home named refs.

### Steps
1. Set write token locally (``SANITY_API_WRITE_TOKEN`` / seed docs).
2. Non-prod first: ``pnpm sanity:seed``
3. Confirm https://kamiyon.sanity.studio Home fields: Partners → Portfolio → Awards → Services → Contact CTA → SEO
4. Smoke staging: Home not blank; About WhoWeAreBand; footer Site Settings strings

### Rules
- Do not wipe dataset; leave legacy ``blocks`` JSON
- Prod mutation only with explicit approval
"@

New-BacklogIssue -Title "ops: WS4b apex DNS cutover (Cloudflare + Vercel pause)" -Body @"
## Operator / manual (dashboard only)

See ``context/dns-cutover-guide.md`` + ``context/deploy-runbook.md``.

### Checklist
- [ ] Attach ``kamiyonstudio.com`` + ``www`` to production Worker
- [ ] Sanity webhook → prod ``/api/revalidate`` (Bearer = prod ``SANITY_REVALIDATE_SECRET``)
- [ ] Redeploy Studio with ``SANITY_STUDIO_API_ORIGIN=https://kamiyonstudio.com``
- [ ] Smoke apex 24–48h
- [ ] Pause/remove Vercel DNS/project
- [ ] Optional: ``workers_dev: false`` on production

CORS for apex+www already done (2026-07-30).
"@

New-BacklogIssue -Title "ops: Resend domain verify + Worker contact secrets" -Body @"
## Operator / manual

In-repo contact form is ready (ADR-018). Live send needs human DNS + secrets.

### Checklist
- [ ] Verify ``send.kamiyonstudio.com`` in Resend (DKIM + SPF)
- [ ] Apex DMARC ``p=none`` with ``rua``
- [ ] Optional: Cloudflare Email Routing ``hello@`` → Gmail
- [ ] ``wrangler secret put RESEND_API_KEY`` on staging/prod Workers
- [ ] Set Worker vars ``CONTACT_FROM_EMAIL`` / ``CONTACT_TO_EMAIL``
- [ ] Smoke ``/contact`` submit on staging
"@

New-BacklogIssue -Title "ops: rotate SANITY_STUDIO_MEDIA_UPLOAD_SECRET if server-only" -Body @"
## Operator / security decision

Hosted Studio deploy warned that ``SANITY_STUDIO_MEDIA_UPLOAD_SECRET`` is **client-bundled** in Studio JS.

### If upload auth must stay server-only
1. Rotate the secret
2. Keep validation on ``/api/media/upload`` server-side only
3. Stop exposing the secret via ``SANITY_STUDIO_*`` client env for ``pnpm sanity:deploy``
4. Redeploy Studio + Workers with the new server secret

If Studio must call upload with a shared secret by design, document that risk and leave as-is.
"@

New-BacklogIssue -Title "ops: confirm GitHub Actions Cloudflare deploy secrets" -Body @"
## Operator / manual

Confirm repo **Settings → Secrets and variables → Actions**:

- [ ] ``CLOUDFLARE_API_TOKEN``
- [ ] ``CLOUDFLARE_ACCOUNT_ID``
- [ ] Optional vars: ``NEXT_PUBLIC_*`` / analytics tokens per env (see ``.github/workflows/deploy.yml``)

Agents cannot set GitHub secrets without org auth.
"@

New-BacklogIssue -Title "ops: services migrate --apply (non-prod only, human gated)" -Body @"
## Operator / human-gated

Gate 0 services migrate is dry-run only until sign-off.

- Script: ``scripts/sanity/migrate-services``
- **Prod / protected datasets forbidden** without explicit approval
- After dry-run review: optional ``--apply`` on non-prod only
"@

New-BacklogIssue -Title "content: Studio CMS edits (team roles, members, portraits, socials)" -Body @"
## Operator / Studio content (no code)

Linked product issues remain open for UX; this tracks the **manual CMS** work:

- [ ] #27 Luis role → Lead designer & producer (retain co-founder)
- [ ] #24 Add Harvey, Danielle, Kien
- [ ] #23 Replace portraits to match sakura branding (not business suits)
- [ ] #26 Team modal social icon hyperlinks (ensure ``socialLinks`` filled in Studio)

Do in https://kamiyon.sanity.studio/ — publish triggers revalidate when webhook is set.
"@

New-BacklogIssue -Title "backlog: Home testimonials section (waiting on design prompt)" -Body @"
## Deferred UI

Do **not** implement until operator provides a custom design prompt.

Tracked in ``context/progress-tracker.md`` (ADR-030).

When ready: design prompt → new RFC → implementation (not a block renderer on Home).
"@

Write-Host ""
Write-Host "Done. Open the repo Issues / Project board and drag new ops items into Todo/In Progress as needed:"
Write-Host "https://github.com/$Owner/$Repo/issues"
Write-Host ""
Write-Host "Still-open product issues (left open): #23 #24 #25 #26 #27 #28 #29"
