import { render, screen } from "@testing-library/react";
import { createElement, type ElementType } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({
    fill: _fill,
    priority: _priority,
    ...props
  }: React.ComponentProps<"img"> & { fill?: boolean; priority?: boolean }) =>
    createElement("img", props),
}));

vi.mock("@/hooks/useOpeningAnimation", () => ({
  useOpeningAnimation: () => ({ current: null }),
}));

vi.mock("@/hooks/useParallax", () => ({
  useParallax: () => ({ current: null }),
}));

vi.mock("@/components/ui/SplitText", () => ({
  SplitText: ({
    tag = "p",
    text,
    className,
  }: {
    tag?: ElementType;
    text: string;
    className?: string;
  }) => createElement(tag, { className }, text),
}));

import { PageOpeningHero } from "./PageOpeningHero";

describe("PageOpeningHero", () => {
  it("renders the centered title over the shared opening stage", () => {
    render(
      <PageOpeningHero id="test-hero" title="TEST TITLE" ariaLabel="Test page" />,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "TEST TITLE" });
    const hero = heading.closest("section");

    expect(hero).toHaveAttribute("id", "test-hero");
    expect(hero).toHaveAttribute("aria-label", "Test page");
    expect(hero).toHaveAttribute("data-nav-theme", "dark");
    expect(hero).toHaveAttribute("data-size", "full");
  });

  it("supports a compact size for peek-below landings", () => {
    render(
      <PageOpeningHero
        id="compact-hero"
        title="COMPACT"
        ariaLabel="Compact"
        size="compact"
      />,
    );

    expect(screen.getByRole("heading", { level: 1 }).closest("section")).toHaveAttribute(
      "data-size",
      "compact",
    );
  });
});
