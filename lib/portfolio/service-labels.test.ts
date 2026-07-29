import { describe, expect, it } from "vitest";

import {
  getPortfolioServiceHref,
  getPortfolioServiceLabel,
} from "./service-labels";

describe("getPortfolioServiceLabel", () => {
  it("returns Gate 0 titles for the five service slugs", () => {
    expect(getPortfolioServiceLabel("game-development")).toBe("Game Development");
    expect(getPortfolioServiceLabel("product-development")).toBe(
      "Product Development"
    );
    expect(getPortfolioServiceLabel("ui-design")).toBe("UI & Design");
    expect(getPortfolioServiceLabel("branding")).toBe("Branding");
    expect(getPortfolioServiceLabel("community-events")).toBe(
      "Community & Events"
    );
  });

  it("does not invent labels for stale old service slugs", () => {
    expect(getPortfolioServiceLabel("mvp-development")).toBeUndefined();
    expect(getPortfolioServiceLabel("ui-ux-design")).toBeUndefined();
    expect(getPortfolioServiceLabel("web-development")).toBeUndefined();
    expect(getPortfolioServiceLabel("creative-services")).toBeUndefined();
  });
});

describe("getPortfolioServiceHref", () => {
  it("links valid Gate 0 services to /services/[slug]", () => {
    expect(getPortfolioServiceHref("ui-design")).toBe("/services/ui-design");
    expect(getPortfolioServiceHref("product-development")).toBe(
      "/services/product-development"
    );
  });

  it("returns undefined for unknown / stale service types", () => {
    expect(getPortfolioServiceHref("mvp-development")).toBeUndefined();
    expect(getPortfolioServiceHref("")).toBeUndefined();
  });
});
