"use client";

import { SterlingGateKineticNavigation } from "@/components/ui/sterling-gate-kinetic-navigation";
import type { NavItem, NavSocialLink } from "@/lib/config/navigation";

type SiteHeaderProps = {
  navItems: readonly {
    label: string;
    href: string;
    children?: readonly { label: string; href: string }[];
  }[];
  contactCta: NavItem;
  siteName: string;
  /** Kept for shell/footer API parity; kinetic nav uses primary routes + CTA. */
  socialLinks?: readonly NavSocialLink[];
};

/**
 * Site chrome header — Kamiyon kinetic overlay nav over shell nav props.
 */
export function SiteHeader({
  navItems,
  contactCta,
  siteName,
  socialLinks: _socialLinks,
}: SiteHeaderProps) {
  return (
    <div className="relative z-50">
      <SterlingGateKineticNavigation
        navItems={navItems}
        contactCta={contactCta}
        siteName={siteName}
        logoSrc="/logo.svg"
      />
    </div>
  );
}
