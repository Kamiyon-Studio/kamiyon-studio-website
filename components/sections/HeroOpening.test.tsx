import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HomeHero } from "@/lib/cms/types";
import type { PartnerPlaceholder } from "@/lib/home/partner-placeholders";
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
    eyebrow?: string;
    partners?: PartnerPlaceholder[];
  }) => partnersMarqueeMock(props),
}));

const baseHero: HomeHero = {
  _type: "hero",
  headline: "Meaningful interactive experiences, built with purpose.",
  subheadline: "A multidisciplinary interactive experience studio.",
  ctaLabel: "Explore our services",
  ctaHref: "/services",
};

const samplePartners: PartnerPlaceholder[] = [
  { id: "partner-1", label: "Partner placeholder" },
  { id: "partner-2", label: "Partner placeholder" },
];

describe("HeroOpening", () => {
  it("renders centered KAMIYON STUDIO brand and motto without CMS copy, CTA, or featured list", () => {
    render(<HeroOpening hero={baseHero} partners={samplePartners} />);

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
    const { container } = render(
      <HeroOpening hero={baseHero} partners={samplePartners} />,
    );

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("id", "home-hero");
    expect(section).toHaveAttribute("data-nav-theme", "dark");
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
    render(<HeroOpening hero={baseHero} partners={samplePartners} />);

    expect(screen.getByTestId("hero-scroll-helper")).toBeInTheDocument();
    expect(screen.getByText("Scroll down")).toBeInTheDocument();
  });

  it("mounts PartnersMarquee with layout=band, tone=onDark, and Trusted by eyebrow when partners are provided", () => {
    partnersMarqueeMock.mockClear();

    render(<HeroOpening hero={baseHero} partners={samplePartners} />);

    expect(screen.getByTestId("partners-marquee-mock")).toBeInTheDocument();
    expect(partnersMarqueeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: "band",
        tone: "onDark",
        eyebrow: "Trusted by",
        partners: samplePartners,
      }),
    );
  });

  it("does not fade the hero into --bg-secondary via hero-partners-blend", () => {
    const { container } = render(
      <HeroOpening hero={baseHero} partners={samplePartners} />,
    );

    expect(
      container.querySelector("[data-testid='hero-partners-blend']"),
    ).not.toBeInTheDocument();

    const secondaryFade = Array.from(container.querySelectorAll("div")).find(
      (el) => el.className.includes("to-[var(--bg-secondary)]"),
    );
    expect(secondaryFade).toBeUndefined();
  });

  it("keeps a soft bottom scrim for logo legibility", () => {
    const { container } = render(
      <HeroOpening hero={baseHero} partners={samplePartners} />,
    );

    expect(
      container.querySelector("[data-testid='hero-bottom-scrim']"),
    ).toBeInTheDocument();
  });

  it("anchors brand in the upper zone and partners in the lower zone", () => {
    const { container } = render(
      <HeroOpening hero={baseHero} partners={samplePartners} />,
    );

    const layout = container.querySelector("[data-testid='hero-opening-layout']");
    expect(layout).toHaveClass("flex", "min-h-[100svh]", "flex-col");

    const brandZone = container.querySelector("[data-testid='hero-brand-zone']");
    expect(brandZone).toBeInTheDocument();
    expect(brandZone).toContainElement(
      screen.getByRole("heading", { level: 1, name: "KAMIYON STUDIO" }),
    );
    expect(brandZone).toContainElement(screen.getByText(SITE_MOTTO));

    const partnersZone = container.querySelector(
      "[data-testid='hero-partners-zone']",
    );
    expect(partnersZone).toBeInTheDocument();
    expect(partnersZone).toContainElement(
      screen.getByTestId("partners-marquee-mock"),
    );
  });
});
