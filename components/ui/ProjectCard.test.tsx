import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CaseStudy } from "@/lib/cms/types";
import { ProjectCard } from "./ProjectCard";

vi.mock("@/lib/cms/image", () => ({
  getCmsImageUrl: vi.fn(),
}));

const baseCaseStudy: CaseStudy = {
  _type: "portfolio",
  title: "Sample Client Project — Placeholder",
  slug: { current: "sample-client-project-placeholder" },
  clientName: "TBD",
  industry: "Education",
  serviceType: "game-development",
  challenge: "A generic challenge summary.",
  solution: "A generic solution summary.",
  impact: "A generic impact summary.",
  gallery: [],
  featured: false,
  isPlaceholder: true,
  seo: { title: "", description: "" },
};

describe("ProjectCard", () => {
  it("links to the case study detail route", () => {
    render(<ProjectCard caseStudy={baseCaseStudy} />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/portfolio/sample-client-project-placeholder"
    );
  });

  it("renders the emoji placeholder when there is no resolvable cover image", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue(null);

    render(<ProjectCard caseStudy={baseCaseStudy} />);

    expect(screen.getByText("🌸")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the cover image when a CMS image URL resolves", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue("/api/media/file/test.png");

    render(<ProjectCard caseStudy={baseCaseStudy} />);

    expect(screen.getByRole("img")).toHaveAttribute("alt", baseCaseStudy.title);
  });

  it("shows a Placeholder badge when isPlaceholder is true", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue(null);

    render(<ProjectCard caseStudy={baseCaseStudy} />);

    expect(screen.getByText("Placeholder")).toBeInTheDocument();
  });

  it("hides the Placeholder badge for published content", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue(null);

    render(<ProjectCard caseStudy={{ ...baseCaseStudy, isPlaceholder: false }} />);

    expect(screen.queryByText("Placeholder")).not.toBeInTheDocument();
  });

  it("renders the Gate 0 service label for a known serviceType", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue(null);

    render(
      <ProjectCard
        caseStudy={{ ...baseCaseStudy, serviceType: "product-development" }}
      />
    );

    expect(screen.getByText("Product Development")).toBeInTheDocument();
    expect(screen.queryByText("Education")).not.toBeInTheDocument();
  });

  it("does not render stale old service titles when serviceType is unknown", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue(null);

    render(
      <ProjectCard caseStudy={{ ...baseCaseStudy, serviceType: "mvp-development" }} />
    );

    expect(screen.queryByText("MVP Development")).not.toBeInTheDocument();
    expect(screen.queryByText("Education")).not.toBeInTheDocument();
  });
});
