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
  children: SpanInput[]
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

/** Single-block body from description text (Gate 0). */
function descriptionBody(text: string): PortableTextBlock[] {
  return serviceBody([block("normal", [span(text)])]);
}

/**
 * Gate 0 five-service taxonomy (ADR-016).
 * Source: context/gate0-services-taxonomy.md — do not invent beyond that matrix.
 */
export const servicesFallback: Service[] = [
  {
    _type: "service",
    title: "Game Development",
    slug: { current: "game-development" },
    tagline: "Build immersive games that inspire, educate, and entertain.",
    summary:
      "We partner with studios, startups, organizations, and businesses to create engaging game experiences—from rapid prototypes to polished commercial titles. Whether it's entertainment, education, or gamified learning, we focus on delivering meaningful interactive experiences.",
    body: descriptionBody(
      "We partner with studios, startups, organizations, and businesses to create engaging game experiences—from rapid prototypes to polished commercial titles. Whether it's entertainment, education, or gamified learning, we focus on delivering meaningful interactive experiences.",
    ),
    capabilities: [
      "Full-cycle game development",
      "Game prototyping",
      "Gameplay programming",
      "Multiplayer implementation",
      "Educational games",
      "Serious games",
    ],
    icon: "gamepad",
    order: 1,
    isPlaceholder: true,
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
    body: descriptionBody(
      "We design and build digital products that solve real-world problems. From startup MVPs to internal platforms, we help organizations launch products that are functional, scalable, and user-focused.",
    ),
    capabilities: [
      "MVP development",
      "Web applications",
      "Mobile applications",
      "AI-powered features",
    ],
    icon: "rocket",
    order: 2,
    isPlaceholder: true,
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
    body: descriptionBody(
      "We create intuitive interfaces and visually compelling assets that elevate products, games, and brands through thoughtful design and user-centered experiences.",
    ),
    capabilities: [
      "UI/UX design",
      "Product interface design",
      "Graphic design",
      "Marketing assets",
      "Social media creatives",
    ],
    icon: "palette",
    order: 3,
    isPlaceholder: true,
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
    body: descriptionBody(
      "A strong brand is more than a logo. We help organizations create cohesive visual identities that communicate their story consistently across every touchpoint.",
    ),
    capabilities: [
      "Brand identity",
      "Logo design",
      "Visual identity systems",
      "Brand guidelines",
      "Presentation design",
    ],
    icon: "brush",
    order: 4,
    isPlaceholder: true,
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
    body: descriptionBody(
      "We help organizations foster thriving developer, gaming, and technology communities through engaging programs and collaborative events that create lasting impact.",
    ),
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
    icon: "users",
    order: 5,
    isPlaceholder: true,
    seo: {
      title: "Community & Events",
      description:
        "Grow communities through meaningful experiences — community and events from Kamiyon Studio.",
    },
  },
];
