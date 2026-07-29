# Security Review Summary — Contact Form & Related APIs

**Date:** 2026-07-29  
**Audience:** Founders / non-technical stakeholders  
**Scope:** Contact form email sending, plus nearby authenticated APIs (media upload, content revalidation)  
**Verdict:** Safe to proceed after one small fix. No critical issues found.

---

## Bottom line

An independent security review looked at the new contact form (the feature that lets visitors email the studio from the website) and related backend endpoints.

| Severity | Count | Meaning for you |
| --- | --- | --- |
| Critical | **0** | Nothing that needs an emergency stop |
| High | **1** | Fix before this contact form goes live |
| Medium | **2** | Real issues, but not from this contact-form work — schedule soon |
| Low | Notes only | Hardening ideas, not blockers |

**Recommendation:** Fix the High item (a few lines of code), then ship. Open a follow-up ticket for the Medium media-upload items.

---

## What was checked (in plain English)

1. **Contact form** — Can a stranger abuse the public “send us a message” form?
2. **Email sending** — Does visitor input get safely turned into emails to the studio?
3. **Secrets** — Are API keys and passwords only in environment config (not in code)?
4. **Admin-only APIs** — Media upload and content refresh: are they locked to authorized callers?

---

## Findings explained

### High — Name field can mess with email headers *(fix before launch)*

**What it is:** The visitor’s name is put into the email subject line (“Contact: Jane Doe”). Right now, special hidden characters in the name are not stripped. In email systems, those characters can sometimes be used to add fake header lines (for example, secretly adding a BCC to an attacker).

**Risk if ignored:** Someone could try to trick the email system into copying messages elsewhere, or otherwise manipulate how the studio notification email is built. Whether our email provider (Resend) already blocks this is *not* something we should rely on — the website should sanitize input itself.

**Business impact:** Low likelihood, high principle — this is a public form with no login. Fixing it is cheap insurance.

**Fix:** Reject or strip line-break / control characters from the name before the email is built. Estimated effort: minutes, not days.

---

### Medium — Media upload is too permissive *(follow-up, not this commit)*

These issues are on an **already authenticated** media upload endpoint (you need a secret key). They were not introduced by the contact-form work, but they are worth fixing soon.

1. **File type not restricted** — The system trusts whatever file type the uploader claims. In theory, someone with the secret could upload HTML/SVG that browsers treat as executable content, hosted on our media CDN.
2. **No file size limit** — Very large files are loaded fully into memory before checks. That can waste resources or crash the upload worker if abused (or if the secret leaks).

**Access control itself is solid** — the secret comparison is done the right way; CORS (which sites may call the API) is locked down.

**Fix:** Allow only expected image types; enforce a maximum file size before reading the whole upload into memory.

---

### Low / notes (no action required now)

| Note | Plain English |
| --- | --- |
| Rate limit is per server instance | Spam protection works, but isn’t shared across every Cloudflare Worker instance. Fine at current traffic. |
| No CAPTCHA yet | A honeypot + rate limit is enough for now. Add Cloudflare Turnstile later if spam becomes a problem. |
| Contact form UI | No XSS (script injection) risk in the form itself — standard text inputs only. |

---

## What already looks good

- No passwords or API keys hardcoded in source code  
- Contact email body content is escaped so message text can’t inject HTML into the email  
- Admin endpoints (media upload, revalidate) use secure secret comparison  
- No database/SQL injection surface on these routes  

---

## Decision checklist for founders

| Decision | Suggested answer |
| --- | --- |
| Ship contact form as-is? | **No** — fix the High (name / subject) issue first |
| Block launch for Medium media issues? | **No** — ticket for next hardening pass |
| Add CAPTCHA before launch? | **Optional** — only if spam appears |
| Who owns the High fix? | Engineering — validate/sanitize `name` in contact helpers |

---

## Status

| Item | Status |
| --- | --- |
| Critical findings | None |
| High: email subject / name sanitization | **Fixed** — C0/DEL/U+2028–9 rejected in `name`/`email` validation; `sanitizeHeaderValue` on subject/`replyTo` (defense-in-depth). See ADR-019. |
| Medium: media MIME allowlist + size cap | **Fixed** — allowlist `image/png|jpeg|webp|gif|avif`; 10 MiB cap via Content-Length + `file.size` before buffering. See ADR-019. |
| Low hardening notes | Accepted for now (documented in ADR-019) |

*Source: `/everything-claude-code:security-review` on contact-form / email API surface (commit `0fffea2` and adjacent routes), 2026-07-29.*
*Remediation: plan `.claude/plans/security-remediation-contact-media.plan.md` (2026-07-29).*
