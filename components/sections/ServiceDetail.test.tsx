import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Service } from "@/lib/cms/types";
import { ServiceDetail } from "./ServiceDetail";

const baseService: Service = {
  _type: "service",
  title: "Game Development",
  slug: { current: "game-development" },
  tagline: "Build immersive games that inspire, educate, and entertain.",
  summary:
    "We partner with studios, startups, organizations, and businesses to create engaging game experiences—from rapid prototypes to polished commercial titles. Whether it's entertainment, education, or gamified learning, we focus on delivering meaningful interactive experiences.",
  body: [
    {
      _type: "block",
      style: "normal",
      children: [{ _type: "span", text: "Body copy." }],
    },
  ],
  capabilities: [
    "Full-cycle game development",
    "Game prototyping",
    "Educational games",
  ],
  order: 1,
  isPlaceholder: false,
  seo: { title: "", description: "" },
};

describe("ServiceDetail", () => {
  it("renders Gate 0 title, tagline, summary, body, and capabilities", () => {
    render(<ServiceDetail service={baseService} />);

    expect(screen.getByRole("heading", { level: 1, name: baseService.title })).toBeInTheDocument();
    expect(screen.getByText(baseService.tagline)).toBeInTheDocument();
    expect(screen.getByText(baseService.summary)).toBeInTheDocument();
    expect(screen.getByText("Body copy.")).toBeInTheDocument();
    expect(screen.getByText("Capabilities")).toBeInTheDocument();
    expect(screen.getByText("Full-cycle game development")).toBeInTheDocument();
  });

  it("does not show obsolete category or outcomes chrome", () => {
    render(<ServiceDetail service={baseService} />);

    expect(screen.queryByText(/interactive experience development/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/what you gain/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/related industries/i)).not.toBeInTheDocument();
  });

  it("shows a Placeholder service badge only when isPlaceholder is true", () => {
    render(<ServiceDetail service={{ ...baseService, isPlaceholder: true }} />);

    expect(screen.getByText("Placeholder service")).toBeInTheDocument();
  });
});
