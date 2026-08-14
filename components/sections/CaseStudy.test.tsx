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
  projectType: "client-work",
  clientName: "TBD",
  industry: "Education",
  serviceType: "game-development",
  shortDescription: "A dual-state movement-platformer card blurb.",
  challenge: "A generic challenge.",
  solution: "A generic solution.",
  impact: "A generic impact.",
  credits: [],
  recognition: [],
  videos: [],
  externalLinks: [],
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

  it("hides empty Gameplay and Technical sections on the client placeholder", () => {
    render(<CaseStudy caseStudy={baseCaseStudy} />);

    expect(screen.queryByRole("heading", { name: "Gameplay" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Technical" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Narrative" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Credits" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Recognition" })).not.toBeInTheDocument();
  });

  it("renders Eclipse-depth sections when they have content", () => {
    render(
      <CaseStudy
        caseStudy={{
          ...baseCaseStudy,
          title: "Eclipse",
          projectType: "original-ip",
          clientName: "Kamiyon Studio",
          isPlaceholder: false,
          positioning: "Changing realities changes the rules of physics.",
          shortDescription: "A dual-state movement-platformer.",
          gameplay: {
            mechanics: [
              { _type: "block", children: [{ _type: "span", text: "State is the interaction model." }] },
            ],
            dualStateTable: {
              leftLabel: "Fragment",
              rightLabel: "Resonance",
              rows: [{ aspect: "Combat", left: "Melee", right: "Sonic pulses" }],
            },
            controls: [{ input: "Right Click", action: "Toggle Visage" }],
          },
          narrative: [
            { _type: "block", children: [{ _type: "span", text: "The Fragmented One." }] },
          ],
          technicalDevelopment: {
            platforms: "PC",
            systems: ["Dual-state world"],
          },
          credits: [{ name: "Sherwin Limosnero", role: "Sound Designer" }],
          recognition: [
            {
              title: "Most Fun Award",
              organization: "CIIT College of Innovation and Integrated Technology",
              year: "2026",
              note: "Global Game Jam 2026 entry",
            },
          ],
        }}
      />
    );

    expect(screen.getByText("Changing realities changes the rules of physics.")).toBeInTheDocument();
    expect(screen.getByText("State is the interaction model.")).toBeInTheDocument();
    expect(screen.getByText("Fragment")).toBeInTheDocument();
    expect(screen.getByText("Toggle Visage")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Narrative" })).toBeInTheDocument();
    expect(screen.getByText("The Fragmented One.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Technical" })).toBeInTheDocument();
    expect(screen.getByText("Dual-state world")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Credits" })).toBeInTheDocument();
    expect(screen.getByText("Sherwin Limosnero")).toBeInTheDocument();
    expect(screen.getByText(/Sound Designer/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recognition" })).toBeInTheDocument();
    expect(screen.getByText("Most Fun Award")).toBeInTheDocument();
  });

  it("renders optional creative, process, engine, video, and link sections only when present", () => {
    render(
      <CaseStudy
        caseStudy={{
          ...baseCaseStudy,
          isPlaceholder: false,
          creativeDirection: [
            { _type: "block", children: [{ _type: "span", text: "Contrast communicates state." }] },
          ],
          process: [
            { _type: "block", children: [{ _type: "span", text: "Jam first, then continue." }] },
          ],
          technicalDevelopment: {
            engine: "Unspecified",
            systems: [],
          },
          videos: [
            { url: "https://example.com/trailer", title: "Trailer" },
            { url: "https://example.com/raw" },
          ],
          recognition: [
            {
              title: "Most Fun Award",
              organization: "CIIT",
              year: "2026",
              url: "https://example.com/award",
            },
          ],
          externalLinks: [
            { label: "Press kit", url: "https://example.com/press", kind: "press" },
          ],
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Creative direction" })).toBeInTheDocument();
    expect(screen.getByText("Contrast communicates state.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Process" })).toBeInTheDocument();
    expect(screen.getByText("Jam first, then continue.")).toBeInTheDocument();
    expect(screen.getByText("Engine")).toBeInTheDocument();
    expect(screen.getByText("Unspecified")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Videos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trailer" })).toHaveAttribute(
      "href",
      "https://example.com/trailer",
    );
    expect(screen.getByRole("link", { name: "https://example.com/raw" })).toHaveAttribute(
      "href",
      "https://example.com/raw",
    );
    expect(screen.getByRole("link", { name: "https://example.com/award" })).toHaveAttribute(
      "href",
      "https://example.com/award",
    );
    expect(screen.getByRole("heading", { name: "Links" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Press kit" })).toHaveAttribute(
      "href",
      "https://example.com/press",
    );
  });
});
