import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CaseStudy, HomeFeaturedWork, Product } from "@/lib/cms/types";
import { FeaturedWork } from "./FeaturedWork";

const baseFeaturedWork: HomeFeaturedWork = {
  _type: "featuredWork",
  title: "Featured work",
  body: "A look at what we're building.",
  featuredProductSlugs: ["eclipse"],
  featuredCaseStudySlugs: ["sample-client-project-placeholder"],
};

const products: Product[] = [
  {
    _type: "product",
    title: "Eclipse",
    slug: { current: "eclipse" },
    tagline: "A 2D platformer about light and shadow.",
    genre: "2D Platformer",
    status: "original-ip",
    developmentStatus: "tbd",
    overview: "",
    goals: [],
    features: [],
    platforms: [],
    media: [],
    isPlaceholder: true,
    order: 1,
    seo: { title: "", description: "" },
  },
];

const caseStudies: CaseStudy[] = [
  {
    _type: "portfolio",
    title: "Sample Client Project — Placeholder",
    slug: { current: "sample-client-project-placeholder" },
    clientName: "TBD",
    industry: "Education",
  serviceType: "game-development",
    challenge: "A generic challenge summary.",
    solution: "",
    impact: "",
    gallery: [],
    featured: false,
    isPlaceholder: true,
    seo: { title: "", description: "" },
  },
];

describe("FeaturedWork", () => {
  it("resolves featured product and case-study slugs into linked cards", () => {
    render(
      <FeaturedWork featuredWork={baseFeaturedWork} products={products} caseStudies={caseStudies} />
    );

    expect(screen.getByRole("link", { name: /Eclipse/ })).toHaveAttribute(
      "href",
      "/products/eclipse"
    );
    expect(screen.getByRole("link", { name: /Sample Client Project/ })).toHaveAttribute(
      "href",
      "/portfolio/sample-client-project-placeholder"
    );
  });

  it("shows a Coming soon badge for placeholder featured items", () => {
    render(
      <FeaturedWork featuredWork={baseFeaturedWork} products={products} caseStudies={caseStudies} />
    );

    expect(screen.getAllByText("Coming soon").length).toBeGreaterThan(0);
  });

  it("omits the Coming soon badge for published featured items", () => {
    render(
      <FeaturedWork
        featuredWork={baseFeaturedWork}
        products={[{ ...products[0], isPlaceholder: false }]}
        caseStudies={[{ ...caseStudies[0], isPlaceholder: false }]}
      />
    );

    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
  });

  it("ignores slugs that don't match any fetched product or case study", () => {
    render(
      <FeaturedWork
        featuredWork={{
          ...baseFeaturedWork,
          featuredProductSlugs: ["not-a-real-product"],
          featuredCaseStudySlugs: [],
        }}
        products={products}
        caseStudies={caseStudies}
      />
    );

    expect(screen.getByText("Featured work is coming soon.")).toBeInTheDocument();
  });

  it("renders an honest empty state when no featured items resolve", () => {
    render(
      <FeaturedWork
        featuredWork={{ ...baseFeaturedWork, featuredProductSlugs: [], featuredCaseStudySlugs: [] }}
        products={[]}
        caseStudies={[]}
      />
    );

    expect(screen.getByText("Featured work is coming soon.")).toBeInTheDocument();
  });

});
