import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HomeHero } from "@/lib/cms/types";
import { SITE_MOTTO } from "@/lib/seo/constants";
import { Hero } from "./Hero";

vi.mock("@/hooks/useOpeningAnimation", () => ({
  useOpeningAnimation: () => ({ current: null }),
}));

vi.mock("@/hooks/useParallax", () => ({
  useParallax: () => ({ current: null }),
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
  ctaLabel: "Get in touch",
  ctaHref: "/contact",
};

describe("Hero", () => {
  it("renders KAMIYON STUDIO and motto without CMS copy or CTA", () => {
    render(<Hero hero={baseHero} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "KAMIYON STUDIO" }),
    ).toBeInTheDocument();
    expect(screen.getByText(SITE_MOTTO)).toBeInTheDocument();
    expect(screen.queryByText("Kamiyon")).not.toBeInTheDocument();
    expect(screen.queryByText(baseHero.headline)).not.toBeInTheDocument();
    expect(screen.queryByText(baseHero.subheadline)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Get in touch" })).not.toBeInTheDocument();
  });

  it("does not render secondary quick links including the products link", () => {
    render(<Hero hero={baseHero} />);

    expect(screen.queryByRole("link", { name: "View products" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "See our portfolio" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Contact us" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Quick links" })).not.toBeInTheDocument();
  });

  it("uses a full-bleed stage image instead of a CMS inset card", () => {
    const { container } = render(<Hero hero={baseHero} />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("relative");

    const background = container.querySelector('img[src*="background.jpg"]');
    expect(background).toBeInTheDocument();

    expect(container.querySelector('[class*="rounded-[var(--radius-card-lg)]"]')).not.toBeInTheDocument();
    expect(screen.queryByText("🌸")).not.toBeInTheDocument();
  });

  it("layers gradient scrims for text readability over the background", () => {
    const { container } = render(<Hero hero={baseHero} />);
    expect(container.querySelector(".bg-gradient-to-b")).toBeInTheDocument();
    expect(container.querySelector(".bg-gradient-to-r")).toBeInTheDocument();
    expect(container.querySelector("[data-testid='hero-partners-blend']")).toBeInTheDocument();
  });

  it("layers a parallax background wrapper and opening curtain", () => {
    const { container } = render(<Hero hero={baseHero} />);

    const background = container.querySelector('img[src*="background.jpg"]');
    expect(background).toBeInTheDocument();
    expect(background?.className).not.toMatch(/animate-hero-ken-burns/);

    const parallaxWrapper = background?.parentElement;
    expect(parallaxWrapper).toHaveClass("will-change-transform");
    expect(parallaxWrapper?.className).toMatch(/inset-\[-20%\]/);
    expect(container.querySelector("[data-opening-curtain]")).toBeInTheDocument();
  });
});
