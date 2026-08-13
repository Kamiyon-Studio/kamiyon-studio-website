import type { SiteSettings } from "../types";
import {
  INTERIM_CONTACT_FORM_URL,
  PUBLIC_EMAIL,
  socialLinks,
} from "@/lib/contact/channels";
import { STUDIO_LOCATION } from "@/lib/seo/constants";

/** Pending Hub Layer 2 — `lib/cms/types.ts` SiteSettings footer* fields. */
export type FooterSettingsFields = {
  footerMarqueeKeywords?: string[];
  footerCtaHeading?: string;
  footerSecondaryCtaLabel?: string;
  footerSecondaryCtaHref?: string;
  footerCopyrightSuffix?: string;
  footerLocationPrefix?: string;
  footerLocation?: string;
};

export const DEFAULT_FOOTER_MARQUEE_KEYWORDS = [
  "Games",
  "EdTech",
  "Portfolio",
  "Interactive Experiences",
  "Contact",
] as const;

export const DEFAULT_FOOTER_CTA_HEADING = "Ready to begin?";
export const DEFAULT_FOOTER_SECONDARY_CTA_LABEL = "View portfolio";
export const DEFAULT_FOOTER_SECONDARY_CTA_HREF = "/portfolio";
export const DEFAULT_FOOTER_COPYRIGHT_SUFFIX = "All rights reserved.";
export const DEFAULT_FOOTER_LOCATION_PREFIX = "Based in ";
export const DEFAULT_FOOTER_LOCATION = STUDIO_LOCATION;

// Sources: docs/company/overview.md, docs/branding/messaging.md, docs/marketing/positioning.md
// Contact URLs: operator-provided 2026-07-10 (lib/contact/channels.ts)
export const siteSettingsFallback = {
  _type: "siteSettings",
  siteName: "Kamiyon Studio",
  tagline:
    "Kamiyon Studio creates games and interactive experiences that educate, inspire, and make a lasting impact.",
  publicEmail: PUBLIC_EMAIL,
  socialLinks,
  defaultSeo: {
    title: "Kamiyon Studio",
    description:
      "Kamiyon Studio is a multidisciplinary interactive experience studio that develops games, educational technologies, gamified platforms, and digital solutions that combine creativity, technology, and thoughtful design to create meaningful impact.",
  },
  globalCtas: [
    {
      label: "Explore our services",
      href: "/services",
      variant: "primary",
    },
    {
      label: "Get in touch",
      href: INTERIM_CONTACT_FORM_URL,
      variant: "secondary",
    },
  ],
  footerText: "Create. Play. Inspire.",
  footerMarqueeKeywords: [...DEFAULT_FOOTER_MARQUEE_KEYWORDS],
  footerCtaHeading: DEFAULT_FOOTER_CTA_HEADING,
  footerSecondaryCtaLabel: DEFAULT_FOOTER_SECONDARY_CTA_LABEL,
  footerSecondaryCtaHref: DEFAULT_FOOTER_SECONDARY_CTA_HREF,
  footerCopyrightSuffix: DEFAULT_FOOTER_COPYRIGHT_SUFFIX,
  footerLocationPrefix: DEFAULT_FOOTER_LOCATION_PREFIX,
  footerLocation: DEFAULT_FOOTER_LOCATION,
} as SiteSettings & FooterSettingsFields;
