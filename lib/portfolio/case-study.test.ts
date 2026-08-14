import { describe, expect, it } from "vitest";

import type { Portfolio } from "@/lib/cms/types";
import {
  getPortfolioCardDescription,
  getPortfolioCtaLabel,
  getPortfolioOwnerLabel,
  getPortfolioProjectTypeLabel,
  getPortfolioStatusLabel,
  hasGameplay,
  hasPortableText,
  hasTechnicalDevelopment,
} from "./case-study";

const baseItem: Portfolio = {
  _type: "portfolio",
  title: "Sample",
  slug: { current: "sample" },
  projectType: "client-work",
  clientName: "TBD",
  industry: "Education",
  serviceType: "branding",
  shortDescription: "Card copy.",
  challenge: "Challenge copy.",
  solution: "Solution.",
  impact: "Impact.",
  credits: [],
  recognition: [],
  videos: [],
  externalLinks: [],
  gallery: [],
  featured: false,
  isPlaceholder: true,
  seo: { title: "", description: "" },
};

describe("portfolio case-study helpers", () => {
  it("labels original IP as Studio, never Client", () => {
    expect(getPortfolioOwnerLabel("original-ip")).toBe("Studio");
    expect(getPortfolioOwnerLabel("client-work")).toBe("Client");
  });

  it("uses a quieter CTA for original IP", () => {
    expect(getPortfolioCtaLabel("original-ip")).toBe("Get in touch");
    expect(getPortfolioCtaLabel("client-work")).toBe("Discuss a similar project");
  });

  it("returns taxonomy titles for known project type and status", () => {
    expect(getPortfolioProjectTypeLabel("original-ip")).toBe("Original IP");
    expect(getPortfolioProjectTypeLabel("client-work")).toBe("Client work");
    expect(getPortfolioProjectTypeLabel("commission")).toBeUndefined();
    expect(getPortfolioStatusLabel("in-development")).toBe("In development");
    expect(getPortfolioStatusLabel("shipping")).toBeUndefined();
  });

  it("treats empty portable text as absent", () => {
    expect(hasPortableText(undefined)).toBe(false);
    expect(hasPortableText([])).toBe(false);
    expect(
      hasPortableText([
        { _type: "block", children: [{ _type: "span", text: "   " }] },
      ]),
    ).toBe(false);
    expect(
      hasPortableText([
        { _type: "block", children: [{ _type: "span", text: "Lore." }] },
      ]),
    ).toBe(true);
  });

  it("hides gameplay when mechanics, table, and controls are empty", () => {
    expect(hasGameplay(undefined)).toBe(false);
    expect(hasGameplay({ controls: [] })).toBe(false);
    expect(
      hasGameplay({
        dualStateTable: { leftLabel: "Fragment", rightLabel: "Resonance", rows: [] },
        controls: [],
      }),
    ).toBe(false);
    expect(
      hasGameplay({
        controls: [{ input: "Right Click", action: "Toggle Visage" }],
      }),
    ).toBe(true);
  });

  it("hides technical development when no engine/platforms/systems/body", () => {
    expect(hasTechnicalDevelopment(undefined)).toBe(false);
    expect(hasTechnicalDevelopment({ systems: [] })).toBe(false);
    expect(
      hasTechnicalDevelopment({ platforms: "PC", systems: [] }),
    ).toBe(true);
    expect(
      hasTechnicalDevelopment({ systems: ["Dual-state world"] }),
    ).toBe(true);
  });

  it("prefers shortDescription on cards and falls back to challenge", () => {
    expect(getPortfolioCardDescription(baseItem)).toBe("Card copy.");
    expect(
      getPortfolioCardDescription({ ...baseItem, shortDescription: "  " }),
    ).toBe("Challenge copy.");
  });
});
