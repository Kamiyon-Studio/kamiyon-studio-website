import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { portfolioItemsFallback } from "@/lib/cms/fallbacks/portfolio";
import { HeroOpening } from "./HeroOpening";

const eclipse = portfolioItemsFallback[0];

describe("HeroOpening", () => {
  it("explains the studio and keeps both direct actions without inventing work", () => {
    const { container } = render(<HeroOpening />);
    expect(screen.getByRole("heading", { level: 1, name: "Games, digital products, and design." })).toBeInTheDocument();
    expect(screen.getByText("Kamiyon Studio")).toBeInTheDocument();
    expect(screen.getByText(/independent Philippine studio/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View our work" })).toHaveAttribute("href", "/portfolio");
    expect(screen.getByRole("link", { name: "Discuss a project" })).toHaveAttribute("href", "/contact");
    expect(container.querySelector("article")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("shows honest project evidence when no image is available", () => {
    const { container } = render(<HeroOpening project={eclipse} />);
    const preview = screen.getByTestId("hero-artwork");
    expect(preview.querySelector("img")).toBeNull();
    expect(screen.getByRole("heading", { name: "Eclipse" })).toBeInTheDocument();
    expect(screen.getByText("Grounded physics")).toBeInTheDocument();
    expect(screen.getByText("Weightless movement")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Read the Eclipse case study" })).toHaveAttribute("href", "/portfolio/eclipse");
    expect(preview).not.toContainElement(screen.getByRole("heading", { level: 1 }));
    expect(container.querySelector("video, [data-opening-curtain]")).toBeNull();
    expect(preview).not.toHaveClass("will-change-transform");
  });

  it("uses actual project artwork and its supplied alt text", () => {
    render(<HeroOpening project={{ ...eclipse, coverImage: { url: "/project.jpg", alt: "Eclipse gameplay" } }} />);
    expect(screen.getByRole("img", { name: "Eclipse gameplay" })).toHaveAttribute("src", expect.stringContaining("project.jpg"));
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("uses a supported gallery image when the cover host is unsupported", () => {
    render(<HeroOpening project={{ ...eclipse, coverImage: { url: "https://unsupported.example/cover.jpg" }, gallery: [{ url: "/gallery.jpg", alt: "Project gallery" }] }} />);
    expect(screen.getByRole("img", { name: "Project gallery" })).toHaveAttribute("src", expect.stringContaining("gallery.jpg"));
  });
});
