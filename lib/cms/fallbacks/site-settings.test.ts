import { describe, expect, it } from "vitest";

import { STUDIO_LOCATION } from "@/lib/seo/constants";

import { siteSettingsFallback } from "./site-settings";

describe("siteSettingsFallback footer fields", () => {
  it("includes footer defaults matching current hardcoded motion-footer copy", () => {
    expect(siteSettingsFallback.footerMarqueeKeywords).toEqual([
      "Games",
      "EdTech",
      "Portfolio",
      "Interactive Experiences",
      "Contact",
    ]);
    expect(siteSettingsFallback.footerCtaHeading).toBe("Ready to begin?");
    expect(siteSettingsFallback.footerSecondaryCtaLabel).toBe("View portfolio");
    expect(siteSettingsFallback.footerSecondaryCtaHref).toBe("/portfolio");
    expect(siteSettingsFallback.footerCopyrightSuffix).toBe(
      "All rights reserved.",
    );
    expect(siteSettingsFallback.footerLocationPrefix).toBe("Based in ");
    expect(siteSettingsFallback.footerLocation).toBe(STUDIO_LOCATION);
  });
});
