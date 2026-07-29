import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CaseStudy as CaseStudyType } from "@/lib/cms/types";
import { CaseStudy } from "./CaseStudy";

vi.mock("@/lib/cms/image", () => ({
  getCmsImageUrl: vi.fn(() => null),
}));

const baseCaseStudy: CaseStudyType = {
  _type: "portfolio",
  title: "Sample Client Project — Placeholder",
  slug: { current: "sample-client-project-placeholder" },
  clientName: "TBD",
  industry: "Education",
  serviceType: "game-development",
  challenge: "A generic challenge.",
  solution: "A generic solution.",
  impact: "A generic impact.",
  gallery: [],
  featured: false,
  isPlaceholder: true,
  seo: { title: "", description: "" },
};

describe("CaseStudy", () => {
  it("renders challenge, solution, and impact sections", () => {
    render(<CaseStudy caseStudy={baseCaseStudy} />);

    expect(screen.getByRole("heading", { name: "Challenge" })).toBeInTheDocument();
    expect(screen.getByText("A generic challenge.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Solution" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Impact" })).toBeInTheDocument();
  });

  it("only renders a lessons-learned section when provided", () => {
    const { rerender } = render(<CaseStudy caseStudy={baseCaseStudy} />);
    expect(screen.queryByRole("heading", { name: "Lessons learned" })).not.toBeInTheDocument();

    rerender(
      <CaseStudy caseStudy={{ ...baseCaseStudy, lessonsLearned: "Ship early, ship often." }} />
    );
    expect(screen.getByRole("heading", { name: "Lessons learned" })).toBeInTheDocument();
    expect(screen.getByText("Ship early, ship often.")).toBeInTheDocument();
  });

  it("shows a placeholder case study badge when isPlaceholder is true", () => {
    render(<CaseStudy caseStudy={baseCaseStudy} />);

    expect(screen.getByText("Placeholder case study")).toBeInTheDocument();
  });

  it("renders the gallery empty state when there are no gallery images", () => {
    render(<CaseStudy caseStudy={baseCaseStudy} />);

    expect(screen.getByText("Gallery coming soon.")).toBeInTheDocument();
  });

  it("hides the placeholder badge when isPlaceholder is false", () => {
    render(<CaseStudy caseStudy={{ ...baseCaseStudy, isPlaceholder: false }} />);

    expect(screen.queryByText("Placeholder case study")).not.toBeInTheDocument();
  });

  it("renders the resolved cover image with its own alt text when available", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue("/api/media/file/test.png");

    render(
      <CaseStudy
        caseStudy={{ ...baseCaseStudy, coverImage: { alt: "Cover shot" } }}
      />
    );

    expect(screen.getByAltText("Cover shot")).toBeInTheDocument();
  });

  it("falls back to the case study title for cover image alt text when unset", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue("/api/media/file/test.png");

    render(<CaseStudy caseStudy={{ ...baseCaseStudy, coverImage: {} }} />);

    expect(screen.getByAltText(baseCaseStudy.title)).toBeInTheDocument();
  });
});
