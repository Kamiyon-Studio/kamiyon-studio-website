import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { caseStudiesFallback } from "@/lib/cms/fallbacks";
import type { CaseStudy } from "@/lib/cms/types";

vi.mock("@/lib/cms/image", () => ({
  getCmsImageUrl: vi.fn(() => null),
}));

vi.mock("@/components/ui/WordPullUp", () => ({
  WordPullUp: ({
    words,
    as: Tag = "h1",
    id,
    className,
  }: {
    words: string;
    as?: keyof HTMLElementTagNameMap;
    id?: string;
    className?: string;
  }) => (
    <Tag id={id} className={className}>
      {words}
    </Tag>
  ),
}));

vi.mock("@/components/animation/AnimatedSection", () => ({
  AnimatedSection: ({
    children,
    as: Tag = "div",
    className,
  }: {
    children: React.ReactNode;
    as?: keyof HTMLElementTagNameMap;
    className?: string;
  }) => <Tag className={className}>{children}</Tag>,
}));

import { ProjectsBento } from "./ProjectsBento";

function makeCaseStudy(overrides: Partial<CaseStudy> & { slug: string }): CaseStudy {
  const { slug, ...rest } = overrides;

  return {
    _type: "portfolio",
    title: "Case study",
    slug: { current: slug },
    clientName: "Client name coming soon",
    industry: "Interactive Experience",
  serviceType: "game-development",
    challenge: "",
    solution: "",
    impact: "",
    gallery: [],
    featured: false,
    isPlaceholder: true,
    seo: { title: "", description: "" },
    ...rest,
  };
}

describe("ProjectsBento", () => {
  it("renders the section eyebrow, heading, and view portfolio CTA", () => {
    render(<ProjectsBento caseStudies={[]} />);

    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent Projects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View portfolio" })).toHaveAttribute(
      "href",
      "/portfolio"
    );
  });

  it("renders eight bento slots with honest placeholders when no case studies exist", () => {
    render(<ProjectsBento caseStudies={[]} />);

    expect(screen.getAllByText("Project coming soon")).toHaveLength(8);
  });

  it("places the featured fallback case study in a large slot and fills the rest with placeholders", () => {
    render(<ProjectsBento caseStudies={caseStudiesFallback} />);

    expect(
      screen.getByRole("link", { name: /Sample Client Project — Placeholder/ })
    ).toHaveAttribute("href", "/portfolio/sample-client-project-placeholder");
    expect(screen.getAllByText("Project coming soon")).toHaveLength(7);
  });

  it("uses a two-column row for large cards and three-column rows for small cards", () => {
    const { container } = render(<ProjectsBento caseStudies={caseStudiesFallback} />);

    const largeRow = container.querySelector('[data-bento-row="large"]');
    const smallRows = container.querySelectorAll('[data-bento-row="small"]');

    expect(largeRow?.className).toMatch(/grid-cols-2/);
    expect(smallRows).toHaveLength(2);
    for (const row of smallRows) {
      expect(row.className).toMatch(/grid-cols-3/);
    }
  });

  it("prioritizes featured case studies into the bento layout", () => {
    const caseStudies = [
      makeCaseStudy({ slug: "regular", title: "Regular project", featured: false }),
      makeCaseStudy({ slug: "featured", title: "Featured project", featured: true }),
    ];

    render(<ProjectsBento caseStudies={caseStudies} />);

    expect(screen.getByRole("link", { name: /Featured project/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Regular project/ })).toBeInTheDocument();
  });
});
