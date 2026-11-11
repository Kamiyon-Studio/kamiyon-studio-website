# Kamiyon Studio Official Website

Kamiyon Studio's marketing and portfolio website presents its games, services, team, and editorial content.
The motto is Create. Play. Inspire.

## Quick start

Use Node.js 22 and pnpm 10.33.2 (declared in package.json).

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Development uses webpack, matching the production build and its font/asset handling.
The development server uses port 3000; browser smoke tests use port 3100.
Use the existing .env.example as the configuration reference and keep secrets out of version control.
For a hermetic local demo, explicitly set APP_ENV=local and CMS_DEMO_CONTENT=true.
Staging and production never use demo fallbacks.

## Maintained architecture

| Layer | Implementation |
| --- | --- |
| Public site | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 and shared brand tokens |
| Content | Published Sanity documents queried with GROQ |
| Editing | Hosted Sanity Studio; /studio redirects there |
| Media | Cloudflare R2 references stored in Sanity |
| Hosting | OpenNext on Cloudflare Workers |
| Contact | Resend-backed form plus established external channels |
| Motion | Existing GSAP and Motion components; see current website decisions |
| Verification | Vitest and Playwright |

The chrome Get in touch CTA retains the external Google Form.
The Contact page sends through Resend when its server-side configuration is present.
See context/deploy-runbook.md for environment and deployment setup.

## Agent reading order

1. context/WEBSITE-ESSENTIAL-CONTEXT.md
2. context/DECISIONS.md
3. context/ui-context.md
4. context/code-standards.md
5. context/progress-tracker.md

Company facts live in docs/ and require explicit authorization to change.
pnpm-lock.yaml is the authoritative dependency lockfile; do not introduce a second package-manager lockfile.
The reviewed lifecycle-script allowlist supports esbuild/workerd executable installation and sharp/unrs-resolver native loading for the existing toolchain.

Updated 2026-11-11.
