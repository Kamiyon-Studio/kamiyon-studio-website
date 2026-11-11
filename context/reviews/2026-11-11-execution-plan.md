# Full-stack execution plan

The root agent is the sole integration orchestrator.
Implementation runs in three dedicated worktrees, all based on b8af856.
No branch pushes to main or staging, which trigger deployment.

| Wave | Owner and branch | Findings and file ownership | Required evidence |
| --- | --- | --- | --- |
| 1 | Security/contact, codex/security-contact | 1, 4, 12, 14, 17; upload API and Studio input, contact API/helpers/form, privacy page, related tests | Unauthorized upload, malformed media, bounded requests, mail partial failure, retry/double-submit and privacy UI checks |
| 1 | CMS/platform, codex/cms-platform | 3, 6, 8, 15, 16, 18; CMS fetch/query/mappers/fallback policy, OpenNext/Wrangler, workflows, package configuration, README and runtime logs | Empty/missing/outage distinctions, publish lifecycle in isolated environment where credentials permit, baseline lint/types/tests/build |
| 1 | Frontend/content, codex/frontend-content | 2, 5, 7, 9, 10, 11, 13, 19, 20; public pages except privacy, layout/navigation, rich-text renderer, motion, metadata and editorial fixtures | Hostile JSON-LD, rich-text fixture, keyboard containment, reduced motion, responsive screenshots, metadata |
| 2 | Orchestrator with independent reviewers | Review each completed task, integrate commits in dependency order, resolve shared-page contracts | Review findings resolved, focused tests repeated after conflict resolution |
| 3 | Orchestrator and verification agents | Integrated build, full lint/type/unit/browser checks, Cloudflare preview and external configuration audit | Saved command outputs and explicit distinction between verified and blocked external checks |

Security owns ContactForm; frontend owns contact page JSON-LD and all other public page templates.
CMS owns fallback data policy; frontend may edit fixture copy but must coordinate overlapping fallback files before integration.
Platform changes to type fixtures outside its ownership must be coordinated with their owner.
Workers are not alone in the repository and must never revert another worker's changes.

Each numbered finding is a task, with a focused commit after implementation, regression verification, and diff review.
Use the explicitly authorized commit-and-push skill for each completed task: inspect status and both diffs, stage only owned changes, inspect staged diff, make one Conventional Commit, fetch/check upstream, and push without force.
Record commit hashes, tests, and remaining external prerequisites in each stream's completion ledger.

Apply pstack boundary-discipline and fix-root-causes principles to every implementation.
Reproduce defects before fixing them, test external boundaries with safe doubles, and drive actual browser journeys for UI changes.
Independent code review is required for each stream, including language/framework specialists where applicable.
Do not declare an external integration verified from a mock or Node-only smoke test.

Keep company claims grounded in existing canon or CMS content.
Use minimal, truthful privacy wording; do not invent a retention period.
Do not retrieve or expose live secrets in logs.
Remote credential rotation, provider provisioning, and publishing tests require actual account access; inspect available access and ask only when no authorized route remains.
Do not fabricate resource identifiers or silently disable useful features to make tests pass.

Completion requires all 20 tasks implemented and reviewed, integrated checks passing, all completed-task commits pushed, and a final ledger distinguishing any external blockers.
