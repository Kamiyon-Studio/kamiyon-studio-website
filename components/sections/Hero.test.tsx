import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HomeHero } from "@/lib/cms/types";
import type { PartnerPlaceholder } from "@/lib/home/partner-placeholders";
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

const partnersMarqueeMock = vi.fn(
  ({
    layout,
    tone,
    partners,
  }: {
    layout?: string;
    tone?: string;
    partners?: PartnerPlaceholder[];
  }) => (
    <div
      data-testid="partners-marquee-mock"
      data-layout={layout}
      data-tone={tone}
      data-partner-count={partners?.length ?? 0}
    />
  ),
);

vi.mock("@/components/sections/PartnersMarquee", () => ({
  PartnersMarquee: (props: {
    layout?: string;
    tone?: string;
    partners?: PartnerPlaceholder[];
  }) => partnersMarqueeMock(props),
}));

const baseHero: HomeHero = {
  _type: "hero",
  headline: "Meaningful interactive experiences, built with purpose.",
  subheadline: "A multidisciplinary interactive experience studio.",
  ctaLabel: "Get in touch",
  ctaHref: "/contact",
};

const samplePartners: PartnerPlaceholder[] = [
  { id: "partner-1", label: "Partner placeholder" },
  { id: "partner-2", label: "Partner placeholder" },
];

describe("Hero", () => {
  it("renders KAMIYON STUDIO and motto without CMS copy or CTA", () => {
    render(<Hero hero={baseHero} partners={samplePartners} />);

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
    render(<Hero hero={baseHero} partners={samplePartners} />);

    expect(screen.queryByRole("link", { name: "View products" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "See our portfolio" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Contact us" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Quick links" })).not.toBeInTheDocument();
  });

  it("uses a full-bleed stage image instead of a CMS inset card", () => {
    const { container } = render(<Hero hero={baseHero} partners={samplePartners} />);

    const section = container.querySelector("section");
    expect(section).toHaveClass("relative");

    const background = container.querySelector('img[src*="background.jpg"]');
    expect(background).toBeInTheDocument();

    expect(container.querySelector('[class*="rounded-[var(--radius-card-lg)]"]')).not.toBeInTheDocument();
    expect(screen.queryByText("🌸")).not.toBeInTheDocument();
  });

  it("layers gradient scrims for text readability without a --bg-secondary handoff", () => {
    const { container } = render(<Hero hero={baseHero} partners={samplePartners} />);
    expect(container.querySelector(".bg-gradient-to-b")).toBeInTheDocument();
    expect(container.querySelector(".bg-gradient-to-r")).toBeInTheDocument();
    expect(
      container.querySelector("[data-testid='hero-partners-blend']"),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector("[data-testid='hero-bottom-scrim']"),
    ).toBeInTheDocument();
  });

  it("layers a parallax background wrapper and opening curtain", () => {
    const { container } = render(<Hero hero={baseHero} partners={samplePartners} />);

    const background = container.querySelector('img[src*="background.jpg"]');
    expect(background).toBeInTheDocument();
    expect(background?.className).not.toMatch(/animate-hero-ken-burns/);

    const parallaxWrapper = background?.parentElement;
    expect(parallaxWrapper).toHaveClass("will-change-transform");
    expect(parallaxWrapper?.className).toMatch(/inset-\[-20%\]/);
    expect(container.querySelector("[data-opening-curtain]")).toBeInTheDocument();
  });

  it("passes partners through to HeroOpening as a band marquee on dark", () => {
    partnersMarqueeMock.mockClear();

    render(<Hero hero={baseHero} partners={samplePartners} />);

    expect(partnersMarqueeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: "band",
        tone: "onDark",
        partners: samplePartners,
      }),
    );
  });
});
