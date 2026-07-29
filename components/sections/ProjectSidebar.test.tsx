import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CaseStudy } from "@/lib/cms/types";
import { ProjectSidebar } from "./ProjectSidebar";

const baseCaseStudy: CaseStudy = {
  _type: "portfolio",
  title: "Sample Client Project — Placeholder",
  slug: { current: "sample-client-project-placeholder" },
  clientName: "TBD",
  industry: "Education",
  serviceType: "game-development",
  challenge: "",
  solution: "",
  impact: "",
  gallery: [],
  featured: false,
  isPlaceholder: true,
  seo: { title: "", description: "" },
};

describe("ProjectSidebar", () => {
  it("renders client and industry, with industry linking back to /portfolio", () => {
    render(<ProjectSidebar caseStudy={baseCaseStudy} />);

    expect(screen.getByText("TBD")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Education" })).toHaveAttribute("href", "/portfolio");
  });

  it("links the Gate 0 service label to /services/[slug]", () => {
    render(
      <ProjectSidebar
        caseStudy={{ ...baseCaseStudy, serviceType: "ui-design" }}
      />
    );

    expect(screen.getByRole("link", { name: "UI & Design" })).toHaveAttribute(
      "href",
      "/services/ui-design"
    );
  });

  it("omits the Service field for stale / unknown serviceType values", () => {
    render(
      <ProjectSidebar
        caseStudy={{ ...baseCaseStudy, serviceType: "mvp-development" }}
      />
    );

    expect(screen.queryByText("Service")).not.toBeInTheDocument();
    expect(screen.queryByText("MVP Development")).not.toBeInTheDocument();
  });

  it("formats and displays a valid published date", () => {
    render(<ProjectSidebar caseStudy={{ ...baseCaseStudy, publishedAt: "2026-05-01" }} />);

    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("May 2026")).toBeInTheDocument();
  });

  it("omits the Published field when there is no publishedAt", () => {
    render(<ProjectSidebar caseStudy={baseCaseStudy} />);

    expect(screen.queryByText("Published")).not.toBeInTheDocument();
  });

  it("omits the Published field when publishedAt is not a valid date", () => {
    render(<ProjectSidebar caseStudy={{ ...baseCaseStudy, publishedAt: "not-a-date" }} />);

    expect(screen.queryByText("Published")).not.toBeInTheDocument();
  });

  it("always renders the contact CTA", () => {
    render(<ProjectSidebar caseStudy={baseCaseStudy} />);

    const cta = screen.getByRole("link", { name: "Discuss a similar project" });
    expect(cta).toHaveAttribute("href", expect.stringContaining("docs.google.com/forms"));
    expect(cta).toHaveAttribute("target", "_blank");
  });
});
