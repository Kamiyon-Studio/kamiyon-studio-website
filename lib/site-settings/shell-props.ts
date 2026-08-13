import type { Cta, SiteSettings, SocialLink } from "@/lib/cms/types";
import {
  DEFAULT_FOOTER_COPYRIGHT_SUFFIX,
  DEFAULT_FOOTER_CTA_HEADING,
  DEFAULT_FOOTER_LOCATION,
  DEFAULT_FOOTER_LOCATION_PREFIX,
  DEFAULT_FOOTER_MARQUEE_KEYWORDS,
  DEFAULT_FOOTER_SECONDARY_CTA_HREF,
  DEFAULT_FOOTER_SECONDARY_CTA_LABEL,
  type FooterSettingsFields,
} from "@/lib/cms/fallbacks/site-settings";
import { INTERIM_CONTACT_FORM_URL } from "@/lib/contact/channels";
import {
  CONTACT_CTA,
  PRIMARY_NAV_ITEMS,
  type NavItem,
  type NavSocialLink,
} from "@/lib/config/navigation";
import { SITE_MOTTO, SITE_NAME } from "@/lib/seo/constants";

function isContactCtaHref(href: string): boolean {
  return (
    href === "/contact" ||
    href === INTERIM_CONTACT_FORM_URL ||
    href === CONTACT_CTA.href ||
    href.startsWith("https://docs.google.com/forms/")
  );
}

export type ShellNavProps = {
  navItems: readonly NavItem[];
  contactCta: NavItem;
  siteName: string;
  footerMotto: string;
  socialLinks: readonly NavSocialLink[];
  footerMarqueeKeywords: readonly string[];
  footerCtaHeading: string;
  footerSecondaryCtaLabel: string;
  footerSecondaryCtaHref: string;
  footerCopyrightSuffix: string;
  footerLocationPrefix: string;
  footerLocation: string;
};

const PLATFORM_LABELS: Record<SocialLink["platform"], string> = {
  facebook: "Facebook",
  linkedin: "LinkedIn",
  itch: "itch.io",
  youtube: "YouTube",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  github: "GitHub",
  email: "Email",
};

export function getContactCtaFromSettings(globalCtas: Cta[]): NavItem {
  const contactCta = globalCtas.find((cta) => isContactCtaHref(cta.href));

  if (contactCta) {
    return {
      label: contactCta.label,
      href: contactCta.href,
    };
  }

  return CONTACT_CTA;
}

export function mapSocialLinksForShell(socialLinks: SocialLink[]): NavSocialLink[] {
  return socialLinks.map((link) => ({
    label: PLATFORM_LABELS[link.platform] ?? link.label,
    href: link.url,
    comingSoon: Boolean(link.isPlaceholder),
    platform: link.platform,
  }));
}

export function getFooterMotto(settings: SiteSettings): string {
  return settings.footerText?.trim() || settings.tagline?.trim() || SITE_MOTTO;
}

function readFooterSettings(settings: SiteSettings): FooterSettingsFields {
  // Cast until Hub Layer 2 adds footer* to SiteSettings + groq/mappers.
  return settings as SiteSettings & FooterSettingsFields;
}

function resolveString(
  value: string | undefined,
  fallback: string,
): string {
  // Preserve intentional leading/trailing spaces (e.g. "Based in ").
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  return value;
}

function resolveMarqueeKeywords(
  value: string[] | undefined,
): readonly string[] {
  if (!value || value.length === 0) {
    return DEFAULT_FOOTER_MARQUEE_KEYWORDS;
  }
  return value;
}

export function buildShellNavProps(settings: SiteSettings): ShellNavProps {
  const footer = readFooterSettings(settings);

  return {
    navItems: PRIMARY_NAV_ITEMS,
    contactCta: getContactCtaFromSettings(settings.globalCtas),
    siteName: settings.siteName.trim() || SITE_NAME,
    footerMotto: getFooterMotto(settings),
    socialLinks: mapSocialLinksForShell(settings.socialLinks),
    footerMarqueeKeywords: resolveMarqueeKeywords(footer.footerMarqueeKeywords),
    footerCtaHeading: resolveString(
      footer.footerCtaHeading,
      DEFAULT_FOOTER_CTA_HEADING,
    ),
    footerSecondaryCtaLabel: resolveString(
      footer.footerSecondaryCtaLabel,
      DEFAULT_FOOTER_SECONDARY_CTA_LABEL,
    ),
    footerSecondaryCtaHref: resolveString(
      footer.footerSecondaryCtaHref,
      DEFAULT_FOOTER_SECONDARY_CTA_HREF,
    ),
    footerCopyrightSuffix: resolveString(
      footer.footerCopyrightSuffix,
      DEFAULT_FOOTER_COPYRIGHT_SUFFIX,
    ),
    footerLocationPrefix: resolveString(
      footer.footerLocationPrefix,
      DEFAULT_FOOTER_LOCATION_PREFIX,
    ),
    footerLocation: resolveString(
      footer.footerLocation,
      DEFAULT_FOOTER_LOCATION,
    ),
  };
}
