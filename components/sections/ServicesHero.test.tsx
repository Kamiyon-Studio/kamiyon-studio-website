import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ServicesHero } from "./ServicesHero";

describe("ServicesHero", () => {
  it("renders SERVICES as the only hero message", () => {
    render(<ServicesHero />);

    const heading = screen.getByRole("heading", { level: 1, name: "SERVICES" });
    const hero = heading.closest("section");

    expect(hero).toHaveAttribute("id", "services-hero");
    expect(hero).toHaveAttribute("data-nav-theme", "dark");
    expect(hero).toHaveAttribute("aria-label", "Services");
    expect(hero).toHaveClass("studio-page-intro");
  });
});
