# CMS/platform execution results

Branch: `codex/cms-platform`, worktree `O:/Documents/GitHub/kamiyon-cms-platform`.
Verified locally on 11-12 November 2026.

| Finding | Change | Commit | Evidence |
| --- | --- | --- | --- |
| 6 | Preserve empty collections, reject CMS outages, restrict demo fixtures | 22258c8 | 58 CMS tests passed; final guard rerun passed 10 tests. Frontend owns detail fallback guards and error UI. |
| 18 | Remove npm lockfile, pin Node 22/pnpm, document actual architecture and reviewed lifecycle scripts | c03a9ce, c330cae | Frozen pnpm install passed. First commit only removes the lockfile; follow-up completes tooling. |
| Wrangler request | Upgrade 4.113.0 to 4.160.1 | c330cae | Exact requested npm command failed with an internal matches error; equivalent pnpm update and frozen install passed. |
| 3, 15 | Real DO queue/tag cache bindings; shared-content staging explicitly read-only; seed/migration guard | 02a8c2e | Four config/guard tests passed. Real workerd tag write/read and unique-run queue completion passed. |
| 16 | Privacy-conscious invalidation events and Worker observability | 10880ee, 02a8c2e | Six revalidation tests passed. Contact identifiers and frontend error UI belong to other streams. |
| 8 | Repair type/mock/hero baseline; gate deployments with reusable quality workflow | This ledger's commit | Full suite: 196 files and 1,121 tests passed. TypeScript passed. ESLint: zero errors and 23 existing warnings. Final typed-mock cleanup retested: 38 tests across four files passed. |

The quality workflow runs Node 22, lint, types, unit tests, browser tests including their production build, and a separate Linux OpenNext adapter build.
Development now uses webpack, following the build reviewer's verified diagnosis.
Root reviewed completed tasks before committing; specialist review and integrated verification remain orchestrator responsibilities.

## Evidence

- `.cache/tests-final.log`: full unit test result.
- `.cache/typecheck-final.log`: successful standalone type check with no diagnostics.
- `.cache/lint-final.log`: successful lint with existing warnings.
- `.cache/cache-proof-final-result.json` and `.cache/cache-proof-final.log`: actual workerd proof.
- `.cache-build-review.log`: successful Next compilation/types/35 prerenders followed by Windows adapter symlink EPERM.

The committed `scripts/verification/cache` harness reproduces the local proof without remote changes.
Each run uses a fresh marker, checks response status, and bounds request and polling timeouts.
The owned workerd process was stopped and evidence retained.

## Limitations

Full OpenNext bundling failed on this Windows host during traced-file symlink creation, even with tool escalation.
Actual adapter Durable Object classes worked locally, but deployed Next cache freshness remains unverified.
Linux CI is the full-bundle verification path; no generated dependency files were patched.
The authenticated Cloudflare account does not contain the configured Kamiyon Workers, as confirmed by the root dashboard inspection.
No remote deployment, provisioning, content mutation, or credential rotation was performed, consistent with the user's later instruction.
Shared-content staging stays read-only; isolated publishing tests need a separate correctly configured dataset.
Remote branch protection, live publish/update/unpublish, credential scopes, and backup restore were not verified.
