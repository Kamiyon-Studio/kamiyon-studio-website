import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Service } from "@/lib/cms/types";
import { ServiceSidebar } from "./ServiceSidebar";

const baseService: Service = {
  _type: "service",
  title: "Game Development",
  slug: { current: "game-development" },
  tagline: "Build immersive games.",
  summary: "",
  body: [],
  capabilities: ["Playable prototype", "Production-ready build"],
  order: 1,
  isPlaceholder: false,
  seo: { title: "", description: "" },
};

describe("ServiceSidebar", () => {
  it("renders capabilities when present", () => {
    render(<ServiceSidebar service={baseService} />);

    expect(screen.getByText("Capabilities")).toBeInTheDocument();
    expect(screen.getByText("Playable prototype")).toBeInTheDocument();
    expect(screen.getByText("Production-ready build")).toBeInTheDocument();
  });

  it("does not repeat the tagline (shown in ServiceDetail header)", () => {
    render(<ServiceSidebar service={baseService} />);

    expect(screen.queryByText("Build immersive games.")).not.toBeInTheDocument();
  });

  it("hides the capabilities section when empty", () => {
    render(<ServiceSidebar service={{ ...baseService, capabilities: [] }} />);

    expect(screen.queryByText("Capabilities")).not.toBeInTheDocument();
  });

  it("always renders the interim Google Form contact CTA", () => {
    render(<ServiceSidebar service={baseService} />);

    const cta = screen.getByRole("link", { name: "Discuss this service" });
    expect(cta).toHaveAttribute("href", expect.stringContaining("docs.google.com/forms"));
    expect(cta).toHaveAttribute("target", "_blank");
  });
});
