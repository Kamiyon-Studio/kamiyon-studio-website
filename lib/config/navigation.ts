import type { SocialPlatform } from "@/lib/cms/types";
import {
  FACEBOOK_PAGE_URL,
  INTERIM_CONTACT_FORM_URL,
  ITCH_URL,
  LINKEDIN_COMPANY_URL,
  PUBLIC_EMAIL,
  X_URL,
  YOUTUBE_URL,
} from "@/lib/contact/channels";

export type NavItem = {
  label: string;
  href: string;
};

/** Primary IA — 6 pages (Products/Community archived). */
export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export const CONTACT_CTA: NavItem = {
  label: "Get in touch",
  href: INTERIM_CONTACT_FORM_URL,
};

export type NavSocialLink = {
  label: string;
  href: string;
  comingSoon?: boolean;
  platform?: SocialPlatform;
};

/** Static social links (shell prefers CMS `siteSettings.socialLinks`). */
export const SOCIAL_LINKS: readonly NavSocialLink[] = [
  { label: "Facebook", href: FACEBOOK_PAGE_URL, platform: "facebook" },
  { label: "LinkedIn", href: LINKEDIN_COMPANY_URL, platform: "linkedin" },
  { label: "itch.io", href: ITCH_URL, platform: "itch" },
  { label: "YouTube", href: YOUTUBE_URL, platform: "youtube" },
  { label: "X", href: X_URL, platform: "x" },
  { label: "Email", href: `mailto:${PUBLIC_EMAIL}`, platform: "email" },
] as const;
