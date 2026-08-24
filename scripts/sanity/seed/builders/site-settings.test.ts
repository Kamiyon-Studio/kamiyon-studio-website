import { describe, expect, it } from "vitest";

import { siteSettingsFallback } from "@/lib/cms/fallbacks/site-settings";

import { buildSiteSettingsDocument } from "./site-settings";

describe("buildSiteSettingsDocument footer fields", () => {
  it("seeds footer CMS fields from siteSettingsFallback", () => {
    const doc = buildSiteSettingsDocument();

    expect(doc.footerMarqueeKeywords).toEqual(
      siteSettingsFallback.footerMarqueeKeywords,
    );
    expect(doc.footerCtaHeading).toBe(siteSettingsFallback.footerCtaHeading);
    expect(doc.footerSecondaryCtaLabel).toBe(
      siteSettingsFallback.footerSecondaryCtaLabel,
    );
    expect(doc.footerSecondaryCtaHref).toBe(
      siteSettingsFallback.footerSecondaryCtaHref,
    );
    expect(doc.footerCopyrightSuffix).toBe(
      siteSettingsFallback.footerCopyrightSuffix,
    );
    expect(doc.footerLocationPrefix).toBe(
      siteSettingsFallback.footerLocationPrefix,
    );
    expect(doc.footerLocation).toBe(siteSettingsFallback.footerLocation);
  });
});
