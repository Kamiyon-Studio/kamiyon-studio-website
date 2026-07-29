import { describe, expect, it } from "vitest";

import type { Service } from "@/lib/cms/types";

import { buildNavItemsWithDropdowns } from "./nav-dropdowns";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
] as const;

function makeService(overrides: Partial<Service> & Pick<Service, "title" | "order">): Service {
  return {
    _type: "service",
    slug: { current: overrides.title.toLowerCase().replace(/\s+/g, "-") },
    tagline: "Tagline",
    summary: "Summary",
    body: [],
    capabilities: ["One"],
    isPlaceholder: true,
    seo: { title: overrides.title, description: "" },
    ...overrides,
  };
}

describe("buildNavItemsWithDropdowns", () => {
  it("attaches ordered service children under Services", () => {
    const result = buildNavItemsWithDropdowns({
      navItems,
      services: [
        makeService({ title: "Branding", order: 2 }),
        makeService({ title: "Game Development", order: 1 }),
      ],
    });

    const services = result.find((item) => item.href === "/services");
    expect(services?.children).toEqual([
      { label: "Game Development", href: "/services/game-development" },
      { label: "Branding", href: "/services/branding" },
    ]);
  });

  it("keeps Portfolio as a standalone link without children", () => {
    const result = buildNavItemsWithDropdowns({
      navItems,
      services: [],
    });

    const portfolio = result.find((item) => item.href === "/portfolio");
    expect(portfolio?.children).toBeUndefined();
    expect(portfolio).toEqual({ label: "Portfolio", href: "/portfolio" });
  });

  it("omits children when services collection is empty", () => {
    const result = buildNavItemsWithDropdowns({
      navItems,
      services: [],
    });

    expect(result.find((item) => item.href === "/services")?.children).toBeUndefined();
  });
});
