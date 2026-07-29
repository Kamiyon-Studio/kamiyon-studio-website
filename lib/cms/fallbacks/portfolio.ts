import type { Portfolio } from "../types";

export const portfolioItemsFallback: Portfolio[] = [
  {
    _type: "portfolio",
    title: "Sample Client Project — Placeholder",
    slug: { current: "sample-client-project-placeholder" },
    clientName: "Client name coming soon",
    industry: "Interactive Experience",
    serviceType: "game-development",
    challenge:
      "This placeholder portfolio item reserves the structure for future approved client work.",
    solution:
      "Published portfolio items will describe Kamiyon Studio's actual approach once client-approved content is available.",
    impact:
      "Impact details will be added only when real outcomes are documented and approved for publication.",
    lessonsLearned:
      "Lessons learned will be replaced with project-specific insights when a real portfolio item is published.",
    gallery: [],
    featured: true,
    isPlaceholder: true,
    seo: {
      title: "Sample Client Project — Placeholder",
      description:
        "A placeholder portfolio structure for future Kamiyon Studio client work.",
    },
  },
];

/** @deprecated Use portfolioItemsFallback. */
export const caseStudiesFallback = portfolioItemsFallback;
