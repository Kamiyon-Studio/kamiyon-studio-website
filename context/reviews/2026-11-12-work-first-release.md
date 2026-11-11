# Work-first frontend direction and release

The user requested another design pass using the repository's `frontend-design-direction` skill and explicitly authorized deployment.
This supersedes the earlier instruction to leave deployment unchanged.

## Direction

- Purpose: help prospective collaborators understand the studio's capabilities, inspect real work, and start an inquiry.
- Audience: prospective clients, collaborators, and players who need concrete project evidence before marketing claims.
- Tone: an editorial portfolio with restrained playfulness.
- Memorable detail: authentic project artwork and evidence in an ivory panel beside a clear studio offering.
- Constraints: retain sakura pink, Geologica/Montserrat, static opening heroes, existing CMS/routing contracts, accessible controls, and responsive layouts without new dependencies.

The hero selects published non-placeholder project artwork through the existing allowlisted image resolver.
When no artwork exists, it presents actual project text and gameplay facts; when no real project exists, it omits the project panel.
Services now expose titles, descriptions, and capabilities in divided rows without repeated decorative scenery.
Shared layouts and the prior mobile fixes remain in place.

## Integration and verification

The release branch is `codex/work-first-design`.
Current staging changes were merged before verification, preserving team-card sizing and deployment summaries alongside the required quality gate.
The stale team-card test was updated to staging's intentional 5:8 proportions.
The production build against public Sanity project `c6ej1xoj`, dataset `kamiyon`, passed, including TypeScript.
Canonical lint passed with zero errors and 14 existing warnings.
Focused hero, service, and team-card tests passed.
Independent React and TypeScript source reviews approved the changes.
Browser and full CI results are recorded in the release PR before promotion.

## Deployment path

[Staging release PR #70](https://github.com/Kamiyon-Studio/kamiyon-studio-website/pull/70) contains the frontend and previously completed full-stack fixes.
Normal repository protections require a peer-approved PR before merging to staging.
Both staging and production environments require deployment approval.
Production additionally requires successful staging deployment and its status check.
No administrator bypass is part of this release plan.

GitHub environment secret names and prior successful deployments were verified; secret values were not read.
Supported Sanity CLI project listing confirms authenticated access to the configured project.
Coordinate hosted Studio deployment with the production Worker because the earlier upload fix replaces the shared browser credential with editor-session authorization.
Publishing the frontend does not authorize editing live CMS documents.
