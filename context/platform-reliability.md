# Publishing, cache, and environment verification

## Content policy

Published Sanity documents are authoritative.
Empty collections stay empty; missing detail documents must return not found.
Transport failures throw a generic error and produce a `cms_fetch_failed` log event instead of replacing content with fixtures.
Required unpublished singleton content produces an explicit error.

Local demos are opt-in: set `APP_ENV=local` and `CMS_DEMO_CONTENT=true` for both build and local server.
This mode skips remote CMS reads and uses fixtures, so it must not be used to validate publication behavior.
Production and staging ignore this flag and cannot serve fixture fallbacks.

## Cache implementation

R2 stores incremental cache entries.
The supported OpenNext Durable Object queue schedules regeneration, and its tag cache uses one shard for this small site.
Both classes are exported by the installed adapter's generated Worker.
The SQLite Durable Object migration is named `v1-cache` and is additive.
Do not rename a deployed migration or delete its classes casually.

This uses the adapter's supported Durable Object alternative instead of requiring a manually provisioned D1 database identifier.
Environment-specific Worker names isolate Durable Object namespaces.
R2 buckets and self-reference services remain environment-specific.
After configuration changes, regenerate bindings with `pnpm cf-typegen`; do not edit `cloudflare-env.d.ts` manually.

Local `next dev` may warn that adapter Durable Object classes are not exported by its proxy Worker.
The adapter's built Worker and `wrangler dev` preview are the appropriate runtime for binding checks.
A plain Next build is insufficient evidence that publishing invalidation works.

## Shared-content staging is read-only

The checked-in staging configuration still reads the production `kamiyon` dataset.
It is explicitly marked `CMS_CONTENT_MODE=read-only` and must not be used for destructive publication experiments.
The hosted Studio linked from staging remains the production editor, not an isolated staging editor.
Set `CMS_CONTENT_MODE=read-only` in any local or CI seed/migration process targeting shared-content staging; the shared write-client factory refuses mutations in this mode.
Do not distribute production write tokens to read-only test jobs.

Before running publication tests, create an isolated Sanity dataset in the owning project and an editor target configured for that dataset.
Give its media references the matching staging R2 base URL and bucket.
Use a scoped test write token and a staging webhook secret.
Only change staging to writable after the effective dataset, Studio, media bucket, and credentials have been verified together.
No new dataset or remote resource identifier is fabricated in this change.

## Publication acceptance exercise

1. Confirm `wrangler whoami` and the target Worker belong to the intended account.
2. Confirm the dataset is isolated and the build is not in local demo mode.
3. Publish one uniquely named test post with a heading, safe link, nested list, and image.
4. Request its public page twice to warm the cache and record the content and response time.
5. Edit its title and body, trigger the authenticated webhook, and poll the page within the agreed freshness window.
6. Confirm the new content is visible without a deployment and the webhook emitted `cms_revalidation_requested`.
7. Unpublish the post and confirm its detail route returns not found and the listing removes it.
8. Restore or delete only the test records created for the exercise, then confirm no production documents changed.

Capture status codes, timestamps, and non-sensitive content identifiers.
Never record webhook credentials, write tokens, inquiry bodies, or visitor addresses.
The webhook log means invalidation was requested, not that every edge location has already refreshed.

## Operations

Worker observability is enabled in the configuration.
Use `wrangler tail --env staging` for a controlled verification run, and check the provider dashboard for delivery status using the request/provider identifiers emitted by the contact flow.
Investigate repeated CMS fetch failures, revalidation failures, and contact delivery failures before treating a successful homepage response as proof of health.
Use the existing Worker deployment history for rollback; verify cache freshness again after a rollback.
Keep production environment approval and branch restrictions enabled.

The reusable Quality workflow runs lint, standalone types, unit tests, and Chromium smoke tests on Node 22.
Deployment jobs depend on that workflow succeeding.
The smoke test server performs the production build, so the build is part of the gate.
Configure repository branch protection to require the published `Verify website` status after confirming its exact displayed name in GitHub.
Workflow configuration alone cannot enable remote branch protection.

## Verification limits

Local demo tests cannot prove live Sanity webhook latency, remote credentials, inbox delivery, backup retention, or restore behavior.
Rehearse a restore against isolated data using the account's actual backup/export configuration before recording recovery as verified.
