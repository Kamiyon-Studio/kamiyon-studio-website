# Editorial publication proposal

This proposal changes source content only.
Production content must remain unchanged until the owner chooses to publish it.

## Services

The five canonical slugs and their approved title, summary, tagline, and capability lists remain unchanged.
The source fixtures now replace repeated summary paragraphs with the existing capability list, a project-brief checklist, and guidance to agree scope, review points, and handover requirements.
No fixed turnaround times, prices, performance claims, client names, or promised results are added.
The exact proposed bodies are in `lib/cms/fallbacks/services.ts`.

Before publishing, export the five published service documents including `_id`, `_rev`, `slug`, `body`, and `isPlaceholder`.
Compare each existing body with the old one-paragraph summary fixture.
Only propose replacing a body when it still exactly matches that old fixture and its placeholder flag remains true.
Preserve any editor-written body and flag that document for review.
Record the before/after bodies and expected revision in the publication ticket.
Apply approved patches using Sanity revision preconditions, setting the reviewed body and clearing the placeholder flag together.
Abort on a changed revision; do not overwrite concurrent editorial work.

## Blog

Demo fixtures are now noindex and production no longer falls back to them.
The public introduction no longer advertises placeholder entries.
Do not delete or unpublish live posts automatically based on words in their title.
Review the exact published document IDs, body content, revisions, and inbound URLs before retiring known stub posts.
Preserve drafts and any post that has gained real editorial content.
Decide whether each retired public URL should return404 or redirect to an actual replacement.

## Timeline

Future-dated timeline entries display a Planned milestone label.
The label states scheduling status without inventing a completed event or changing the underlying milestone copy.
Verify any entry without an ISO date manually when preparing content for publication.

## Verification after approved publication

Confirm the service body matches the approved version, no duplicate summary appears, and relevant portfolio links work.
Verify retired posts are absent from public listing and sitemap and do not reappear from demo fallbacks.
Verify warm-cache publish, edit, and unpublish behavior in staging before production publication.
No publication or mutation command was run as part of preparing this proposal.
