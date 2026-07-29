import { describe, expect, it } from "vitest";

import { servicesFallback } from "./services";

/** Gate 0 locked taxonomy — do not invent beyond this matrix. */
const GATE0_SERVICES = [
  {
    order: 1,
    slug: "game-development",
    title: "Game Development",
    tagline: "Build immersive games that inspire, educate, and entertain.",
    summary:
      "We partner with studios, startups, organizations, and businesses to create engaging game experiences—from rapid prototypes to polished commercial titles. Whether it's entertainment, education, or gamified learning, we focus on delivering meaningful interactive experiences.",
    capabilities: [
      "Full-cycle game development",
      "Game prototyping",
      "Gameplay programming",
      "Multiplayer implementation",
      "Educational games",
      "Serious games",
    ],
  },
  {
    order: 2,
    slug: "product-development",
    title: "Product Development",
    tagline: "Transform ideas into modern digital products.",
    summary:
      "We design and build digital products that solve real-world problems. From startup MVPs to internal platforms, we help organizations launch products that are functional, scalable, and user-focused.",
    capabilities: [
      "MVP development",
      "Web applications",
      "Mobile applications",
      "AI-powered features",
    ],
  },
  {
    order: 3,
    slug: "ui-design",
    title: "UI & Design",
    tagline: "Design experiences people love to use.",
    summary:
      "We create intuitive interfaces and visually compelling assets that elevate products, games, and brands through thoughtful design and user-centered experiences.",
    capabilities: [
      "UI/UX design",
      "Product interface design",
      "Graphic design",
      "Marketing assets",
      "Social media creatives",
    ],
  },
  {
    order: 4,
    slug: "branding",
    title: "Branding",
    tagline: "Build memorable brands with purpose.",
    summary:
      "A strong brand is more than a logo. We help organizations create cohesive visual identities that communicate their story consistently across every touchpoint.",
    capabilities: [
      "Brand identity",
      "Logo design",
      "Visual identity systems",
      "Brand guidelines",
      "Presentation design",
    ],
  },
  {
    order: 5,
    slug: "community-events",
    title: "Community & Events",
    tagline: "Grow communities through meaningful experiences.",
    summary:
      "We help organizations foster thriving developer, gaming, and technology communities through engaging programs and collaborative events that create lasting impact.",
    capabilities: [
      "Community building",
      "Community management",
      "Hackathons",
      "Game jams",
      "Workshops",
      "Seminars",
      "Meetups",
      "Developer programs",
      "Partnership activations",
    ],
  },
] as const;

describe("servicesFallback (Gate 0 five-service taxonomy)", () => {
  it("exports exactly five flat services in fixed order", () => {
    expect(servicesFallback).toHaveLength(5);
    expect(servicesFallback.map((s) => s.slug.current)).toEqual(
      GATE0_SERVICES.map((s) => s.slug),
    );
    expect(servicesFallback.map((s) => s.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it("matches Gate 0 title, tagline, summary, and capabilities verbatim", () => {
    for (let i = 0; i < GATE0_SERVICES.length; i++) {
      const expected = GATE0_SERVICES[i]!;
      const actual = servicesFallback[i]!;

      expect(actual._type).toBe("service");
      expect(actual.title).toBe(expected.title);
      expect(actual.slug).toEqual({ current: expected.slug });
      expect(actual.tagline).toBe(expected.tagline);
      expect(actual.summary).toBe(expected.summary);
      expect(actual.capabilities).toEqual([...expected.capabilities]);
      expect(actual.order).toBe(expected.order);
      expect(actual.isPlaceholder).toBe(true);
    }
  });

  it("uses flat schema shape without category, outcomes, or relatedIndustries", () => {
    for (const service of servicesFallback) {
      expect(service).not.toHaveProperty("categorySlug");
      expect(service).not.toHaveProperty("category");
      expect(service).not.toHaveProperty("outcomes");
      expect(service).not.toHaveProperty("relatedIndustries");
      expect(Array.isArray(service.capabilities)).toBe(true);
      expect(typeof service.tagline).toBe("string");
      expect(service.tagline.length).toBeGreaterThan(0);
    }
  });

  it("seeds body as one portable block from the same description text", () => {
    for (const service of servicesFallback) {
      expect(service.body).toHaveLength(1);
      const block = service.body[0]!;
      expect(block._type).toBe("block");
      expect(block.style).toBe("normal");
      const text = block.children.map((c) => c.text).join("");
      expect(text).toBe(service.summary);
    }
  });

  it("keeps seo title aligned with service title", () => {
    for (const service of servicesFallback) {
      expect(service.seo.title).toBe(service.title);
      expect(service.seo.description.length).toBeGreaterThan(0);
    }
  });
});
