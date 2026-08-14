import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { caseStudiesFallback } from "@/lib/cms/fallbacks";
import type { CaseStudy } from "@/lib/cms/types";
import { HERO_PROJECTS_SEAM_SVH } from "@/lib/home/hero-parallax-layers";

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
    projectType: "client-work",
    shortDescription: "",
    challenge: "",
    solution: "",
    impact: "",
    credits: [],
    recognition: [],
    videos: [],
    externalLinks: [],
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

  it("paints the earth plate behind Recent Projects when a CDN URL is provided", () => {
    const { container } = render(
      <ProjectsBento
        caseStudies={[]}
        backgroundSrc="https://media.kamiyonstudio.com/site/hero/parallax/v3/ground.avif"
      />,
    );

    const underlay = container.querySelector(
      "[data-testid='home-projects-background'] img",
    );
    expect(underlay?.getAttribute("src")).toContain("ground.avif");
    expect(underlay).toHaveAttribute("alt", "");
  });

  it("tucks the earth plate under the hero cliff and fades it in", () => {
    const { container } = render(
      <ProjectsBento
        caseStudies={[]}
        backgroundSrc="https://media.kamiyonstudio.com/site/hero/parallax/v3/ground.avif"
      />,
    );

    const section = container.querySelector("#home-projects");
    expect(section).toHaveStyle({
      marginTop: `-${HERO_PROJECTS_SEAM_SVH}svh`,
      paddingTop: `calc(${HERO_PROJECTS_SEAM_SVH}svh + 2.5rem)`,
    });

    const underlay = container.querySelector(
      "[data-testid='home-projects-background']",
    );
    const style = underlay?.getAttribute("style") ?? "";
    expect(style).toMatch(/mask-image/i);
    expect(style).toContain(`${HERO_PROJECTS_SEAM_SVH}svh`);
  });

  it("keeps the original section fill when no earth plate is provided", () => {
    const { container } = render(<ProjectsBento caseStudies={[]} />);

    expect(
      container.querySelector("[data-testid='home-projects-background']"),
    ).toBeNull();
    expect(container.querySelector("#home-projects")).toHaveClass("bg-[var(--bg-primary)]");
  });

  it("hides the carousel when no case studies exist", () => {
    render(<ProjectsBento caseStudies={[]} />);

    expect(screen.queryByRole("link", { name: /Eclipse/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Project coming soon")).not.toBeInTheDocument();
  });

  it("shows fallback case studies in the carousel", () => {
    render(<ProjectsBento caseStudies={caseStudiesFallback} />);

    expect(screen.getByRole("link", { name: /Eclipse/ })).toHaveAttribute(
      "href",
      "/portfolio/eclipse",
    );
    expect(
      screen.getByRole("button", { name: /Sample Client Project — Placeholder/ }),
    ).toBeInTheDocument();
  });

  it("prioritizes featured case studies as the active slide", () => {
    const caseStudies = [
      makeCaseStudy({ slug: "regular", title: "Regular project", featured: false }),
      makeCaseStudy({ slug: "featured", title: "Featured project", featured: true }),
    ];

    render(<ProjectsBento caseStudies={caseStudies} />);

    expect(screen.getByRole("link", { name: /Featured project/ })).toHaveAttribute(
      "href",
      "/portfolio/featured",
    );
    expect(screen.getByRole("button", { name: /Regular project/ })).toBeInTheDocument();
  });
});
