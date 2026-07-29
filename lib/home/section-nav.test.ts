import { describe, expect, it } from "vitest";

import { HOME_SECTION_NAV } from "./section-nav";

describe("HOME_SECTION_NAV", () => {
  it("lists unique section ids in home composition order", () => {
    expect(HOME_SECTION_NAV.map((item) => item.id)).toEqual([
      "home-hero",
      "home-partners",
      "home-projects",
      "home-services",
      "home-contact",
    ]);

    const ids = HOME_SECTION_NAV.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("pairs each anchor with the expected label", () => {
    expect(HOME_SECTION_NAV.map((item) => item.label)).toEqual([
      "Hero",
      "Partners",
      "Projects",
      "Services",
      "Contact",
    ]);
  });
});
