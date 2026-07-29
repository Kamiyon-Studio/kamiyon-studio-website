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

import { ServicesHero } from "./ServicesHero";

describe("ServicesHero", () => {
  it("renders SERVICES as the only hero message", () => {
    render(<ServicesHero />);

    const heading = screen.getByRole("heading", { level: 1, name: "SERVICES" });
    const hero = heading.closest("section");

    expect(hero).toHaveAttribute("id", "services-hero");
    expect(hero).toHaveAttribute("data-nav-theme", "dark");
    expect(hero).toHaveAttribute("aria-label", "Services");
    expect(hero).toHaveAttribute("data-size", "compact");
  });
});
