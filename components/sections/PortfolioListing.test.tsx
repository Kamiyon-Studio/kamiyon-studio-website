import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CaseStudy } from "@/lib/cms/types";
import { PortfolioListing } from "./PortfolioListing";

vi.mock("@/lib/cms/image", () => ({
  getCmsImageUrl: vi.fn(() => null),
}));

function makeCaseStudy(
  overrides: Partial<CaseStudy> & Pick<CaseStudy, "title" | "slug" | "serviceType">
): CaseStudy {
  return {
    _type: "portfolio",
    clientName: "TBD",
    industry: "Education",
    challenge: "A challenge.",
    solution: "",
    impact: "",
    gallery: [],
    featured: false,
    isPlaceholder: true,
    seo: { title: "", description: "" },
    ...overrides,
  };
}

const caseStudy = makeCaseStudy({
  title: "Sample Client Project — Placeholder",
  slug: { current: "sample-client-project-placeholder" },
  serviceType: "game-development",
});

describe("PortfolioListing", () => {
  it("renders a ProjectCard per case study", () => {
    render(<PortfolioListing caseStudies={[caseStudy]} />);

    expect(screen.getByRole("link", { name: /Sample Client Project/ })).toHaveAttribute(
      "href",
      "/portfolio/sample-client-project-placeholder"
    );
  });

  it("renders the EmptyState when there are no case studies", () => {
    render(<PortfolioListing caseStudies={[]} />);

    expect(screen.getByText("Projects coming soon.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });

  it("shows Gate 0 service filter chips in taxonomy order for present services only", () => {
    render(
      <PortfolioListing
        caseStudies={[
          makeCaseStudy({
            title: "Community Work",
            slug: { current: "community-work" },
            serviceType: "community-events",
          }),
          makeCaseStudy({
            title: "Product Work",
            slug: { current: "product-work" },
            serviceType: "product-development",
          }),
          makeCaseStudy({
            title: "Stale MVP",
            slug: { current: "stale-mvp" },
            serviceType: "mvp-development",
          }),
        ]}
      />
    );

    const buttons = screen.getAllByRole("button");
    const labels = buttons.map((button) => button.textContent);

    expect(labels).toEqual(["All", "Product Development", "Community & Events"]);
    expect(screen.queryByRole("button", { name: "MVP Development" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "UI/UX Design" })).not.toBeInTheDocument();
  });

  it("filters projects when a service chip is selected", async () => {
    const user = userEvent.setup();
    render(
      <PortfolioListing
        caseStudies={[
          makeCaseStudy({
            title: "Game Project",
            slug: { current: "game-project" },
            serviceType: "game-development",
            challenge: "Game challenge.",
          }),
          makeCaseStudy({
            title: "Brand Project",
            slug: { current: "brand-project" },
            serviceType: "branding",
            challenge: "Brand challenge.",
          }),
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Branding" }));

    expect(screen.getByRole("link", { name: /Brand Project/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Game Project/ })).not.toBeInTheDocument();
  });

  it("restores all projects when All is selected", async () => {
    const user = userEvent.setup();
    render(
      <PortfolioListing
        caseStudies={[
          makeCaseStudy({
            title: "Game Only",
            slug: { current: "game-only" },
            serviceType: "game-development",
          }),
          makeCaseStudy({
            title: "Brand Only",
            slug: { current: "brand-only" },
            serviceType: "branding",
          }),
        ]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Branding" }));
    expect(screen.queryByRole("link", { name: /Game Only/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByRole("link", { name: /Game Only/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Brand Only/ })).toBeInTheDocument();
  });
});
