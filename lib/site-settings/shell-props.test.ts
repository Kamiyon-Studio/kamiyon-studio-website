import { describe, expect, it } from "vitest";

import { siteSettingsFallback } from "@/lib/cms/fallbacks/site-settings";
import type { SiteSettings } from "@/lib/cms/types";
import { INTERIM_CONTACT_FORM_URL } from "@/lib/contact/channels";

import {
  buildShellNavProps,
  getContactCtaFromSettings,
  getFooterMotto,
  mapSocialLinksForShell,
} from "./shell-props";

describe("buildShellNavProps", () => {
  it("maps CMS site settings to header/footer shell props", () => {
    const settings: SiteSettings = {
      ...siteSettingsFallback,
      siteName: "Kamiyon Studio CMS",
      footerText: "Create. Play. Inspire.",
      globalCtas: [
        { label: "Explore our services", href: "/services", variant: "primary" },
        {
          label: "Contact us",
          href: INTERIM_CONTACT_FORM_URL,
          variant: "secondary",
        },
      ],
      socialLinks: [
        {
          platform: "facebook",
          url: "https://facebook.com/kamiyon",
          label: "Facebook",
          isPlaceholder: false,
        },
      ],
    };

    const props = buildShellNavProps(settings);

    expect(props.siteName).toBe("Kamiyon Studio CMS");
    expect(props.footerMotto).toBe("Create. Play. Inspire.");
    expect(props.contactCta).toEqual({
      label: "Contact us",
      href: INTERIM_CONTACT_FORM_URL,
    });
    expect(props.socialLinks[0]).toEqual({
      label: "Facebook",
      href: "https://facebook.com/kamiyon",
      comingSoon: false,
      platform: "facebook",
    });
    expect(props.navItems).toHaveLength(6);
    expect(props.navItems.map((item) => item.label)).toEqual([
      "Home",
      "About",
      "Services",
      "Portfolio",
      "Blog",
      "Contact",
    ]);
  });

  it("falls back to interim Google Form CTA when no contact href exists", () => {
    expect(
      getContactCtaFromSettings([
        { label: "Explore our services", href: "/services", variant: "primary" },
      ])
    ).toEqual({ label: "Get in touch", href: INTERIM_CONTACT_FORM_URL });
  });

  it("still accepts legacy /contact global CTAs from CMS", () => {
    expect(
      getContactCtaFromSettings([
        { label: "Contact us", href: "/contact", variant: "secondary" },
      ]),
    ).toEqual({ label: "Contact us", href: "/contact" });
  });

  it("prefers footerText over tagline for the footer motto", () => {
    expect(
      getFooterMotto({
        ...siteSettingsFallback,
        footerText: "Create. Play. Inspire.",
        tagline: "Tagline copy",
      })
    ).toBe("Create. Play. Inspire.");
  });

  it("maps live social links as active footer links", () => {
    expect(mapSocialLinksForShell(siteSettingsFallback.socialLinks)[0]).toEqual({
      label: "Facebook",
      href: "https://www.facebook.com/kamiyonstudio",
      comingSoon: false,
      platform: "facebook",
    });
  });

  it("maps itch, youtube, and x platforms for the shell", () => {
    const mapped = mapSocialLinksForShell(siteSettingsFallback.socialLinks);
    const byPlatform = Object.fromEntries(
      mapped.map((link) => [link.platform, link]),
    );

    expect(byPlatform.itch).toEqual({
      label: "itch.io",
      href: "https://kamiyon-studio.itch.io/",
      comingSoon: false,
      platform: "itch",
    });
    expect(byPlatform.youtube).toEqual({
      label: "YouTube",
      href: "https://youtube.com/@kamiyonstudio",
      comingSoon: false,
      platform: "youtube",
    });
    expect(byPlatform.x).toEqual({
      label: "X",
      href: "https://x.com/kamiyonstudio",
      comingSoon: false,
      platform: "x",
    });
  });
});
