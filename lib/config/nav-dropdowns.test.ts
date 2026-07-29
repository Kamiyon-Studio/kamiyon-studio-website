import { describe, expect, it } from "vitest";

import type { Portfolio, Service } from "@/lib/cms/types";

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

function makePortfolio(title: string, slug: string): Portfolio {
  return {
    _type: "portfolio",
    title,
    slug: { current: slug },
    clientName: "Client",
    industry: "Games",
    serviceType: "game-development",
    challenge: "C",
    solution: "S",
    impact: "I",
    gallery: [],
    featured: false,
    isPlaceholder: true,
    seo: { title, description: "" },
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
      portfolioItems: [],
    });

    const services = result.find((item) => item.href === "/services");
    expect(services?.children).toEqual([
      { label: "Game Development", href: "/services/game-development" },
      { label: "Branding", href: "/services/branding" },
    ]);
  });

  it("attaches portfolio children under Portfolio", () => {
    const result = buildNavItemsWithDropdowns({
      navItems,
      services: [],
      portfolioItems: [makePortfolio("Sample", "sample")],
    });

    const portfolio = result.find((item) => item.href === "/portfolio");
    expect(portfolio?.children).toEqual([
      { label: "Sample", href: "/portfolio/sample" },
    ]);
  });

  it("omits children when collections are empty", () => {
    const result = buildNavItemsWithDropdowns({
      navItems,
      services: [],
      portfolioItems: [],
    });

    expect(result.find((item) => item.href === "/services")?.children).toBeUndefined();
    expect(result.find((item) => item.href === "/portfolio")?.children).toBeUndefined();
  });
});
