import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HomeHero } from "@/lib/cms/types";
import { SITE_MOTTO } from "@/lib/seo/constants";
import { HeroOpening } from "./HeroOpening";

vi.mock("@/hooks/useOpeningAnimation", () => ({
  useOpeningAnimation: () => ({ current: null }),
}));

vi.mock("@/hooks/useParallax", () => ({
  useParallax: () => ({ current: null }),
}));

vi.mock("@/components/sections/HeroScrollHelper", () => ({
  HeroScrollHelper: () => (
    <div role="status" data-testid="hero-scroll-helper">
      Scroll down
    </div>
  ),
}));

vi.mock("@/components/ui/SplitText", () => ({
  SplitText: ({
    text,
    tag: Tag = "p",
    className,
  }: {
    text: string;
    tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
    className?: string;
  }) => <Tag className={className}>{text}</Tag>,
  default: ({
    text,
    tag: Tag = "p",
    className,
  }: {
    text: string;
    tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
    className?: string;
  }) => <Tag className={className}>{text}</Tag>,
}));

const baseHero: HomeHero = {
  _type: "hero",
  headline: "Meaningful interactive experiences, built with purpose.",
  subheadline: "A multidisciplinary interactive experience studio.",
  ctaLabel: "Explore our services",
  ctaHref: "/services",
};

describe("HeroOpening", () => {
  it("renders centered KAMIYON STUDIO brand and motto without CMS copy, CTA, or featured list", () => {
    render(<HeroOpening hero={baseHero} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "KAMIYON STUDIO" }),
    ).toBeInTheDocument();
    expect(screen.getByText(SITE_MOTTO)).toBeInTheDocument();

    expect(screen.queryByText("Kamiyon")).not.toBeInTheDocument();
    expect(screen.queryByText(baseHero.headline)).not.toBeInTheDocument();
    expect(screen.queryByText(baseHero.subheadline)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Explore our services" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Featured work" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Eclipse")).not.toBeInTheDocument();
  });

  it("includes a full-bleed stage, curtain layer, and parallax background wrapper", () => {
    const { container } = render(<HeroOpening hero={baseHero} />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("min-h-[100svh]");
    expect(container.querySelector("[data-opening-curtain]")).toBeInTheDocument();

    const stage = container.querySelector('img[src*="background.jpg"]');
    expect(stage).toBeInTheDocument();
    expect(stage?.className).not.toMatch(/animate-hero-ken-burns/);

    const parallaxWrapper = stage?.parentElement;
    expect(parallaxWrapper).toHaveClass("will-change-transform");
    expect(parallaxWrapper?.className).toMatch(/inset-\[-20%\]/);

    const bleed = stage?.closest("[aria-hidden='true']");
    expect(bleed).toHaveClass("absolute", "inset-0");
  });

  it("mounts the hero scroll helper tip", () => {
    render(<HeroOpening hero={baseHero} />);

    expect(screen.getByTestId("hero-scroll-helper")).toBeInTheDocument();
    expect(screen.getByText("Scroll down")).toBeInTheDocument();
  });
});
