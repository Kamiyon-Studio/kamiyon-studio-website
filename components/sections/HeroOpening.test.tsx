import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SITE_MOTTO } from "@/lib/seo/constants";
import { HeroOpening } from "./HeroOpening";

describe("HeroOpening", () => {
  it("explains the studio and keeps both direct actions", () => {
    render(<HeroOpening />);

    expect(screen.getByRole("heading", { level: 1, name: "Kamiyon Studio" })).toBeInTheDocument();
    expect(screen.getByText(SITE_MOTTO)).toBeInTheDocument();
    expect(screen.getByText(/Games, digital products, and design from an independent Philippine studio\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View our work" })).toHaveAttribute("href", "/portfolio");
    expect(screen.getByRole("link", { name: "Discuss a project" })).toHaveAttribute("href", "/contact");
  });

  it("keeps the illustration separate from readable copy with no scroll effect", () => {
    const { container } = render(<HeroOpening />);
    const artwork = screen.getByTestId("hero-artwork");
    expect(artwork.querySelector("img")).toHaveAttribute("alt", "");
    expect(artwork).not.toContainElement(screen.getByRole("heading", { level: 1 }));
    expect(container.querySelector("[data-opening-curtain]")).toBeNull();
    expect(container.querySelector('[data-testid="hero-scroll-helper"]')).toBeNull();
    expect(artwork).not.toHaveClass("will-change-transform");
  });
});
