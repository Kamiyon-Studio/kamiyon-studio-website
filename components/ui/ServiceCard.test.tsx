import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Service } from "@/lib/cms/types";
import { ServiceCard } from "./ServiceCard";

const baseService: Service = {
  _type: "service",
  title: "Game Development",
  slug: { current: "game-development" },
  tagline: "Build immersive games that inspire, educate, and entertain.",
  summary: "Full-cycle game development services.",
  body: [],
  capabilities: ["Full-cycle game development"],
  order: 1,
  isPlaceholder: false,
  seo: { title: "", description: "" },
};

describe("ServiceCard", () => {
  it("links to the service detail route", () => {
    render(<ServiceCard service={baseService} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/services/game-development");
  });

  it("shows service capabilities without decorative placeholder imagery", () => {
    const { container } = render(<ServiceCard service={baseService} />);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("list", { name: "Capabilities" })).toHaveTextContent("Full-cycle game development");
  });

  it("shows a Placeholder badge only when isPlaceholder is true", () => {
    const { rerender } = render(<ServiceCard service={baseService} />);

    expect(screen.queryByText("Placeholder")).not.toBeInTheDocument();

    rerender(<ServiceCard service={{ ...baseService, isPlaceholder: true }} />);

    expect(screen.getByText("Placeholder")).toBeInTheDocument();
  });

  it("prefers tagline over summary for card positioning copy", () => {
    render(<ServiceCard service={baseService} />);

    expect(screen.getByRole("heading", { name: "Game Development" })).toBeInTheDocument();
    expect(
      screen.getByText("Build immersive games that inspire, educate, and entertain."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Full-cycle game development services.")).not.toBeInTheDocument();
  });

  it("falls back to summary when tagline is empty", () => {
    render(<ServiceCard service={{ ...baseService, tagline: "" }} />);

    expect(screen.getByText("Full-cycle game development services.")).toBeInTheDocument();
  });

  it("exposes a view-service call to action via the link name", () => {
    render(<ServiceCard service={baseService} />);

    expect(
      screen.getByRole("link", { name: "Game Development — view service" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/view service/i)).toBeInTheDocument();
  });

  it("omits an empty capabilities list", () => {
    render(<ServiceCard service={{ ...baseService, capabilities: [] }} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
