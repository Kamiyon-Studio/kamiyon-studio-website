import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CaseStudy } from "@/lib/cms/types";
import { BentoProjectCard } from "./BentoProjectCard";

vi.mock("@/lib/cms/image", () => ({
  getCmsImageUrl: vi.fn(),
}));

const caseStudy: CaseStudy = {
  _type: "portfolio",
  title: "Sample Client Project — Placeholder",
  slug: { current: "sample-client-project-placeholder" },
  clientName: "Client name coming soon",
  industry: "Interactive Experience",
  serviceType: "game-development",
  challenge: "",
  solution: "",
  impact: "",
  gallery: [],
  featured: true,
  isPlaceholder: true,
  seo: { title: "", description: "" },
};

describe("BentoProjectCard", () => {
  it("links to the portfolio detail route when a case study is provided", () => {
    render(<BentoProjectCard caseStudy={caseStudy} />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/portfolio/sample-client-project-placeholder"
    );
  });

  it("renders the title and uppercase industry for a real case study", () => {
    render(<BentoProjectCard caseStudy={caseStudy} />);

    expect(screen.getByText("Sample Client Project — Placeholder")).toBeInTheDocument();
    expect(screen.getByText("Interactive Experience")).toBeInTheDocument();
  });

  it("shows a Placeholder badge for placeholder case studies", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue(null);

    render(<BentoProjectCard caseStudy={caseStudy} />);

    expect(screen.getByText("Placeholder")).toBeInTheDocument();
  });

  it("renders an emoji image fallback when no cover image resolves", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue(null);

    render(<BentoProjectCard caseStudy={caseStudy} />);

    expect(screen.getByText("🌸")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders a non-interactive honest placeholder card when no case study is provided", () => {
    render(<BentoProjectCard caseStudy={null} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Project coming soon")).toBeInTheDocument();
    expect(screen.getByText("Case study")).toBeInTheDocument();
    expect(screen.getByText("Placeholder")).toBeInTheDocument();
  });
});
