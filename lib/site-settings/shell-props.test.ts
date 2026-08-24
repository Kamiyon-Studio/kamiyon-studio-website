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

  it("passes footer CMS fields with defaults matching current hardcoded copy", () => {
    const props = buildShellNavProps(siteSettingsFallback);

    expect(props.footerMarqueeKeywords).toEqual([
      "Games",
      "EdTech",
      "Portfolio",
      "Interactive Experiences",
      "Contact",
    ]);
    expect(props.footerCtaHeading).toBe("Ready to begin?");
    expect(props.footerSecondaryCtaLabel).toBe("View portfolio");
    expect(props.footerSecondaryCtaHref).toBe("/portfolio");
    expect(props.footerCopyrightSuffix).toBe("All rights reserved.");
    expect(props.footerLocationPrefix).toBe("Based in ");
    expect(props.footerLocation).toBe("Biñan City, Laguna, Philippines");
  });

  it("prefers CMS footer fields when present on site settings", () => {
    const settings = {
      ...siteSettingsFallback,
      footerMarqueeKeywords: ["Custom", "Keywords"],
      footerCtaHeading: "Custom heading",
      footerSecondaryCtaLabel: "Custom label",
      footerSecondaryCtaHref: "/custom",
      footerCopyrightSuffix: "Custom suffix.",
      footerLocationPrefix: "From ",
      footerLocation: "Cebu City",
    } as SiteSettings;

    const props = buildShellNavProps(settings);

    expect(props.footerMarqueeKeywords).toEqual(["Custom", "Keywords"]);
    expect(props.footerCtaHeading).toBe("Custom heading");
    expect(props.footerSecondaryCtaLabel).toBe("Custom label");
    expect(props.footerSecondaryCtaHref).toBe("/custom");
    expect(props.footerCopyrightSuffix).toBe("Custom suffix.");
    expect(props.footerLocationPrefix).toBe("From ");
    expect(props.footerLocation).toBe("Cebu City");
  });
});
