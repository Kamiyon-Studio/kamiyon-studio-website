import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageOpeningHero } from "./PageOpeningHero";

describe("PageOpeningHero", () => {
  it("keeps a static, immediately visible title and optional content", () => {
    const { container } = render(
      <PageOpeningHero id="test-hero" title="TEST TITLE" ariaLabel="Test page" description="A useful introduction.">
        <a href="#content">Explore the page</a>
      </PageOpeningHero>,
    );
    const heading = screen.getByRole("heading", { level: 1, name: "TEST TITLE" });
    const hero = heading.closest("section");
    expect(hero).toHaveAttribute("id", "test-hero");
    expect(hero).toHaveAttribute("aria-label", "Test page");
    expect(hero).toHaveAttribute("data-nav-theme", "dark");
    expect(screen.getByText("A useful introduction.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Explore the page" })).toHaveAttribute("href", "#content");
    expect(container.querySelector("img, video, canvas, [data-opening-curtain]")).toBeNull();
  });

  it("does not render an empty description", () => {
    const { container } = render(<PageOpeningHero id="simple" title="Simple" ariaLabel="Simple" />);
    expect(container.querySelector("p")).toBeNull();
  });
});
