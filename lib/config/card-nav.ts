import {
  SOCIAL_LINKS,
  type NavItem,
  type NavSocialLink,
} from "@/lib/config/navigation";

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

const CARD_TEXT = "var(--color-ivory)";
const CARD_BG_PRIMARY = "var(--color-charcoal)";
const CARD_BG_SECONDARY =
  "color-mix(in srgb, var(--color-charcoal) 88%, var(--color-ivory))";
const CARD_BG_TERTIARY =
  "color-mix(in srgb, var(--color-charcoal) 78%, var(--color-ivory))";

/**
 * Maps shell nav into CardNav's 3-card model (About / Work / Contact).
 */
export function buildCardNavItems(
  contactCta: NavItem,
  socialLinks: readonly NavSocialLink[] = SOCIAL_LINKS,
): CardNavItem[] {
  const contactLinks: CardNavLink[] = [
    {
      label: contactCta.label,
      href: contactCta.href,
      ariaLabel: contactCta.label,
    },
    ...socialLinks.map((link) => ({
      label: link.label,
      href: link.href,
      ariaLabel: link.label,
    })),
  ];

  return [
    {
      label: "About",
      bgColor: CARD_BG_PRIMARY,
      textColor: CARD_TEXT,
      links: [
        { label: "Home", href: "/", ariaLabel: "Home" },
        { label: "Studio", href: "/about", ariaLabel: "Studio" },
      ],
    },
    {
      label: "Work",
      bgColor: CARD_BG_SECONDARY,
      textColor: CARD_TEXT,
      links: [
        { label: "Services", href: "/services", ariaLabel: "Services" },
        { label: "Products", href: "/products", ariaLabel: "Products" },
        { label: "Portfolio", href: "/portfolio", ariaLabel: "Portfolio" },
        { label: "Community", href: "/community", ariaLabel: "Community" },
        { label: "Blog", href: "/blog", ariaLabel: "Blog" },
      ],
    },
    {
      label: "Contact",
      bgColor: CARD_BG_TERTIARY,
      textColor: CARD_TEXT,
      links: contactLinks,
    },
  ];
}
