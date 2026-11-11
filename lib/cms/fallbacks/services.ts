import type { PortableTextBlock, Service } from "../types";

type SpanInput = {
  text: string;
  marks?: string[];
};

function span(text: string, marks?: string[]): SpanInput {
  return marks ? { text, marks } : { text };
}

function block(
  style: "normal" | "h2" | "h3",
  children: SpanInput[],
): PortableTextBlock {
  return {
    _type: "block",
    style,
    children: children.map((child) => ({
      _type: "span" as const,
      text: child.text,
      ...(child.marks ? { marks: child.marks } : {}),
    })),
    markDefs: [],
  };
}

/** Canon-backed portable text for service bodies (normal/h2/h3 + strong/em only). */
function serviceBody(blocks: PortableTextBlock[]): PortableTextBlock[] {
  return blocks;
}

/**
 * Gate 0 five-service taxonomy (ADR-016).
 * Source: context/gate0-services-taxonomy.md — do not invent beyond that matrix.
 */
export const servicesFallback: Service[] = ([
  {
    _type: "service",
    title: "Game Development",
    slug: { current: "game-development" },
    tagline: "Build immersive games that inspire, educate, and entertain.",
    summary:
      "We partner with studios, startups, organizations, and businesses to create engaging game experiences—from rapid prototypes to polished commercial titles. Whether it's entertainment, education, or gamified learning, we focus on delivering meaningful interactive experiences.",
    body: [],
    capabilities: [
      "Full-cycle game development",
      "Game prototyping",
      "Gameplay programming",
      "Multiplayer implementation",
      "Educational games",
      "Serious games",
    ],

    order: 1,
    isPlaceholder: false,
    seo: {
      title: "Game Development",
      description:
        "Build immersive games that inspire, educate, and entertain — game development from Kamiyon Studio.",
    },
  },
  {
    _type: "service",
    title: "Product Development",
    slug: { current: "product-development" },
    tagline: "Transform ideas into modern digital products.",
    summary:
      "We design and build digital products that solve real-world problems. From startup MVPs to internal platforms, we help organizations launch products that are functional, scalable, and user-focused.",
    body: [],
    capabilities: [
      "MVP development",
      "Web applications",
      "Mobile applications",
      "AI-powered features",
    ],

    order: 2,
    isPlaceholder: false,
    seo: {
      title: "Product Development",
      description:
        "Transform ideas into modern digital products — product development from Kamiyon Studio.",
    },
  },
  {
    _type: "service",
    title: "UI & Design",
    slug: { current: "ui-design" },
    tagline: "Design experiences people love to use.",
    summary:
      "We create intuitive interfaces and visually compelling assets that elevate products, games, and brands through thoughtful design and user-centered experiences.",
    body: [],
    capabilities: [
      "UI/UX design",
      "Product interface design",
      "Graphic design",
      "Marketing assets",
      "Social media creatives",
    ],

    order: 3,
    isPlaceholder: false,
    seo: {
      title: "UI & Design",
      description:
        "Design experiences people love to use — UI and design from Kamiyon Studio.",
    },
  },
  {
    _type: "service",
    title: "Branding",
    slug: { current: "branding" },
    tagline: "Build memorable brands with purpose.",
    summary:
      "A strong brand is more than a logo. We help organizations create cohesive visual identities that communicate their story consistently across every touchpoint.",
    body: [],
    capabilities: [
      "Brand identity",
      "Logo design",
      "Visual identity systems",
      "Brand guidelines",
      "Presentation design",
    ],

    order: 4,
    isPlaceholder: false,
    seo: {
      title: "Branding",
      description:
        "Build memorable brands with purpose — branding from Kamiyon Studio.",
    },
  },
  {
    _type: "service",
    title: "Community & Events",
    slug: { current: "community-events" },
    tagline: "Grow communities through meaningful experiences.",
    summary:
      "We help organizations foster thriving developer, gaming, and technology communities through engaging programs and collaborative events that create lasting impact.",
    body: [],
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

    order: 5,
    isPlaceholder: false,
    seo: {
      title: "Community & Events",
      description:
        "Grow communities through meaningful experiences — community and events from Kamiyon Studio.",
    },
  },
] satisfies Service[]).map((service) => ({
  ...service,
  body: serviceBody([
    block("h2", [span("What we can help with")]),
    ...service.capabilities.map((capability) =>
      block("normal", [span(capability)]),
    ),
    block("h2", [span("Start with your project brief")]),
    block("normal", [
      span(
        "Tell us who the work is for, what you want to achieve, and any existing materials or constraints. Include your target platform, timeline, and budget range if you have them.",
      ),
    ]),
    block("h2", [span("Define the scope together")]),
    block("normal", [
      span(
        "Use the initial conversation to agree the deliverables, review points, and handover requirements for your project. The scope depends on the work you need; the capabilities listed here are a starting point for that discussion.",
      ),
    ]),
  ]),
}));
