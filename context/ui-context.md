# UI Context

## Theme

Kamiyon Studio's website is a **warm, premium marketing site** — not a dark technical workspace. The visual language balances playful creativity with professional craftsmanship: bright White (`#F8F8F8`) backgrounds, Black (`#201013`) typography, Primary pink (`#FF7998`) accents, and Secondary gold (`#E9C080`) used sparingly.

### Skeleton Labs + Kamiyon tokens

- **Skeleton** (`@skeletonlabs/skeleton` / `skeleton-react`) is the **primitive layer** (Tailwind utilities + React compounds such as Accordion).
- **Kamiyon tokens** in `app/globals.css` remain the **brand source of truth** (`--color-sakura`, `--bg-*`, `--text-*`, radii).
- Active theme: `data-theme="kamiyon"` on `<html>` (custom theme in `app/themes/kamiyon.css`). Light-only; no theme switcher.
- New UI: prefer Skeleton primitives wrapped in `components/ui/*` adapters so call sites keep consuming `var(--token)` and public APIs stay stable.
- **Exception (ADR-020):** Contact FAQ uses `components/ui/InteractiveAccordion` (own state + `motion/react` springs) instead of the Skeleton Accordion wrapper — numbered interactive pattern on `/contact#faq` only.

> **Locked website tokens:** see [`WEBSITE-ESSENTIAL-CONTEXT.md`](./WEBSITE-ESSENTIAL-CONTEXT.md) §8 — that file wins on conflicts.

Visitors should feel: professional, creative, approachable, trustworthy, innovative, educational.

> **Source:** [`docs/branding/visual-identity.md`](../docs/branding/visual-identity.md), [`docs/design-system/color-palette.md`](../docs/design-system/color-palette.md), [`docs/marketing/website-guidelines.md`](../docs/marketing/website-guidelines.md)

**Design pillars for this site:** Clarity first, simplicity over density, accessibility by default, playful structure without chaos.

> **Source:** [`docs/design-system/design-philosophy.md`](../docs/design-system/design-philosophy.md)

---

## Colors

Use CSS custom properties for all colors. Components must reference tokens — no ad-hoc hex in components.

### Brand palette (locked 2026-07-21)

| Role | CSS Variable | Value | Usage |
| --- | --- | --- | --- |
| Primary | `--color-primary` / `--color-sakura` | `#FF7998` | Brand, CTAs, highlights, fills |
| Secondary | `--color-secondary` / `--color-gold` | `#E9C080` | Sparse premium accents |
| Black | `--color-black` / `--color-charcoal` | `#201013` | Body text, navigation |
| White | `--color-white` / `--color-ivory` | `#F8F8F8` | Primary page background |

**Accessibility tint:** `--color-primary-ink` / `--color-sakura-ink` — darkened primary for text/icons on light backgrounds (raw `#FF7998` fails AA as text on white). Derived UI utility, not a fifth brand color. Pair primary **fills** with `--text-on-accent` → `#201013`.

### Semantic UI tokens (map to brand palette)

| Role | CSS Variable | Maps to |
| --- | --- | --- |
| Page background | `--bg-base` | `--color-white` |
| Surface / card | `--bg-surface` | slightly elevated white |
| Primary text | `--text-primary` | `--color-black` |
| Muted text | `--text-muted` | black at reduced opacity |
| Primary accent | `--accent-primary` | `--color-primary` |
| Border | `--border-default` | black ~10–15% opacity |
| Premium highlight | `--accent-premium` | `--color-secondary` |
| Text/icon on accent fill | `--text-on-accent` | `--color-black` |

### Color hierarchy (emphasis order)

1. Primary `#FF7998` → 2. Black `#201013` → 3. White `#F8F8F8` → 4. Secondary `#E9C080`

> **Source of truth for website:** [`WEBSITE-ESSENTIAL-CONTEXT.md`](./WEBSITE-ESSENTIAL-CONTEXT.md) §8. Canon `docs/design-system/color-palette.md` may still mention Deep Indigo — ignore for this site unless re-locked.

### Accessibility

- Maintain sufficient contrast for all text/background pairs (WCAG AA minimum).
- Never use color as the only indicator of state or meaning.
- Raw primary `#FF7998` is ~2.6:1 on white — use `--color-primary-ink` for text/icons/focus rings; use `--text-on-accent` on primary fills.

---

## Typography

| Role | Font | CSS Variable | Usage |
| --- | --- | --- | --- |
| Display / UI (primary) | **Geologica** | `--font-display` / `--font-sans` | Navigation, buttons, headings, UI labels |
| Body / supporting (secondary) | **Montserrat** | `--font-body` | Body copy, captions, supporting text |

Load via `next/font/google` with `display: swap`. **Do not use** Beaufort or Poppins in production.

> **Source of truth:** [`WEBSITE-ESSENTIAL-CONTEXT.md`](./WEBSITE-ESSENTIAL-CONTEXT.md) §8 (wins over older visual-identity font lists).

### Type scale (marketing site)

| Element | Font | Weight guidance |
| --- | --- | --- |
| Page title (h1) | Geologica | 600–700 |
| Section title (h2) | Geologica | 600–700 |
| Subsection (h3) | Geologica | 600 |
| Body | Montserrat | 400 |
| Small / caption | Montserrat | 400, muted color |
| Button / nav | Geologica | 500–600 |

---

## Border Radius

Rounded, friendly geometry — not sharp corporate corners.

| Context | Class / token |
| --- | --- |
| Buttons, inputs | `rounded-lg` (~8px) |
| Cards, panels | `rounded-xl` (~12px) |
| Large hero cards | `rounded-2xl` (~16px) |
| Pills / tags | `rounded-full` |

> **Source:** visual-identity "Personality Through Detail" — rounded corners, gentle curves

---

## Logo

**Primary mark:** Stylized sakura blossom + "Kamiyon Studio" wordmark.

| Rule | Detail |
| --- | --- |
| Use primary logo when space allows | Icon + wordmark in brand colors |
| Minimum size | Switch to icon-only if wordmark illegible |
| Clear space | Preserve empty space around logo; no overlapping elements |
| Backgrounds | Warm ivory, white, deep indigo, charcoal — maintain contrast |
| Prohibited | Stretch, rotate, skew, unofficial colors, heavy shadows/glows |
| Assets | [`docs/assets/logo.png`](../docs/assets/logo.png), [`docs/assets/logo-frame.png`](../docs/assets/logo-frame.png), [`docs/assets/svg.svg`](../docs/assets/svg.svg) |

> **Source:** [`docs/design-system/logo-guidelines.md`](../docs/design-system/logo-guidelines.md)

**Header placement:** Logo links to Home; visible on all pages.

---

## Kami-chan (Mascot)

| Attribute | Canon |
| --- | --- |
| Role | Official mascot and brand ambassador — not the company logo |
| Personality | Curious, creative, playful, intelligent |
| Symbol | Sakura blossom |
| Usage | Marketing accents, community tone, optional homepage illustration — complements logo, never replaces it |

Do not use Kami-chan as the sole site identifier. Reference asset: [`docs/assets/kami-chan-concept-art.png`](../docs/assets/kami-chan-concept-art.png)

> **Source:** [`docs/branding/mascot-kami-chan.md`](../docs/branding/mascot-kami-chan.md)

---

## Tone of Voice (UI Copy)

Website tone: **confident, clear, welcoming.**

- Prefer: build, explore, learn, create, discover, collaborate
- Avoid overuse: revolutionary, disruptive, game-changing, best-in-class, cutting-edge
- CTAs invite participation: "Explore our services", "Learn more", "Get in touch" — not aggressive sales language
- Educate before selling; honest communication; no exaggerated claims

> **Source:** [`docs/branding/tone-of-voice.md`](../docs/branding/tone-of-voice.md)

Microcopy (buttons, empty states, errors) follows the same voice.

---

## Visual Motifs (use sparingly)

- Sakura petals, rounded geometric shapes, soft gradients
- Subtle Filipino textile / sampaguita accents
- Layered paper-inspired compositions
- Motifs complement content — they do not overpower readability

> **Source:** [`docs/branding/visual-identity.md`](../docs/branding/visual-identity.md)

---

## Layout Patterns

Marketing site patterns — full-width heroes, constrained content columns.

### Global shell

- **Header:** Fixed CardNav chrome — closed: logo left + 2-bar burger right (no route links / CTA hidden); open: top-right stacked About / Work / Contact cards with X | logo | Get in touch; ghost/transparent over home hero
- **Footer:** Logo, nav repeat, social links (Facebook, LinkedIn, email), copyright, optional motto
- **Content width:** `max-w-6xl` or `max-w-7xl` centered; generous horizontal padding

### Per page type

| Page | Layout |
| --- | --- |
| Home | Combined full-bleed opening stage (brand + motto upper; partners band lower, `/#home-partners`, `data-nav-theme="dark"`, ADR-023) → projects bento → **services vertical marquee** (`/#home-services`, ADR-021) → contact CTA |
| About | Full-viewport `ABOUT US` hero (`data-nav-theme="dark"`, homepage-like bg/parallax/opening) → two-column `OUR STORY` editorial intro → GSAP ScrollTrigger story timeline (heading/summary + empty entries until milestones publish; no outer AnimatedSection) → vision band → values grid → team grid → culture closing |
| Services | Intro → category groups → service card grid → industries callout → CTA |
| Products | Intro → product card grid → detail: hero media + features + goals |
| Portfolio | Intro → case study cards (story-focused) → detail: challenge / solution / impact |
| Community | Intro → filtered item feed (type tags) → detail optional |
| Contact | Centered intro → channel cards (icon + label + link) — no form |

### Spacing

- Section vertical padding: `py-16` to `py-24` on desktop; `py-12` mobile
- Card internal padding: `p-6` to `p-8`
- Prefer whitespace over density (simplicity first)

---

## Motion

Animations should communicate delight, not distraction:

- Soft fades, gentle page section reveals
- Elastic button hover states (subtle)
- Optional floating sakura petal decoration on hero (performance-safe, `prefers-reduced-motion` respected)
- Avoid fast, harsh, or decorative-only animation

### Typography motion standard

| Element | Pattern | Component |
| --- | --- | --- |
| Section / page headings (`h1`–`h2`) | Word pull-up stagger on scroll into view | `components/ui/WordPullUp` |
| Body copy, eyebrows, supporting text | Fade + slight rise on scroll | `AnimatedSection` / `useFadeIn` |
| Full-bleed opening hero brand | Character split (GSAP) — special case | `components/ui/SplitText` in `HeroOpening` / `AboutHero` |
| About story timeline | Center progress line via GSAP ScrollTrigger scrub; sticky year rail (xl+); static under reduced motion | `components/ui/timeline` via `StoryTimeline` — do **not** wrap in outer `AnimatedSection` |
| Contact FAQ accordion | Numbered spring height reveal (`motion/react`); single-open | `components/ui/InteractiveAccordion` (ADR-020) |
| Home services discovery | Vertical text marquee; each row is a link to `/services/{slug}`; static list under reduced motion | `components/ui/cta-with-text-marquee` via `ServicesStack` (ADR-021) |

Do not wrap an entire section in `AnimatedSection` when the heading should pull up independently — animate the heading with `WordPullUp` and fade the remaining copy/content separately.

> **Source:** visual-identity Motion Design

Always honor `prefers-reduced-motion: reduce`.

---

## Placeholder Media Guidelines

Until real CMS media exists:

- Use neutral branded placeholders (ivory background, sakura accent, generic illustration silhouette)
- **Never** use fake client logos, stock photos implying specific partnerships, or fabricated award badges
- Product screenshots: "Media coming soon" state with product title and genre
- Team photos: initials avatar or generic silhouette with canon name/role
- Optimize all images via `next/image` with explicit width/height and alt text

---

## Icons

- Stroke-based icon set (e.g. Lucide React) consistent with clean, friendly UI
- Sizes: `h-4 w-4` inline, `h-5 w-5` buttons, `h-6 w-6` feature icons
- Icon color: charcoal default; sakura for interactive emphasis

---

## Responsive Baseline

- Mobile-first breakpoints (Tailwind defaults)
- Touch targets minimum 44×44px
- Navigation collapses to drawer/menu below `md`
- Typography scales down one step on mobile
- Images fluid width; no horizontal scroll

---

## Accessibility Baseline

- Semantic HTML (`header`, `nav`, `main`, `footer`, heading hierarchy)
- Skip-to-content link
- Focus visible styles on all interactive elements
- Alt text on all meaningful images; decorative images `alt=""`
- External links: `rel="noopener noreferrer"` when `target="_blank"`
- Color contrast verified when TBD hex values are finalized

---

## Visual Consistency Checklist

Before shipping a page, verify:

- [ ] Feels unmistakably Kamiyon (warm, playful, professional)
- [ ] Uses design tokens, not hardcoded colors
- [ ] Typography hierarchy is clear
- [ ] Logo and mascot follow usage rules
- [ ] Copy matches tone of voice
- [ ] Placeholders are honest (no fake achievements)
- [ ] Accessible and responsive

> **Source:** visual-identity Visual Consistency Checklist
