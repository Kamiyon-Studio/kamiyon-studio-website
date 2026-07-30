import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ParallaxLayerMotion } from "@/hooks/useLayeredParallax";
import {
  HERO_PARALLAX_BRAND_Y_PERCENT,
  HERO_PARALLAX_LAYERS,
  type ResolvedHeroParallaxLayer,
} from "@/lib/home/hero-parallax-layers";
import type { PartnerPlaceholder } from "@/lib/home/partner-placeholders";
import { SITE_MOTTO } from "@/lib/seo/constants";
import { HeroParallaxOpening } from "./HeroParallaxOpening";

vi.mock("@/hooks/useOpeningAnimation", () => ({
  useOpeningAnimation: () => ({ current: null }),
}));

const layeredParallaxMock = vi.fn((_layers: readonly ParallaxLayerMotion[]) => ({
  current: null,
}));

vi.mock("@/hooks/useLayeredParallax", () => ({
  useLayeredParallax: (layers: readonly ParallaxLayerMotion[]) =>
    layeredParallaxMock(layers),
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
    tag?: "h1" | "p";
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

const layers: ResolvedHeroParallaxLayer[] = HERO_PARALLAX_LAYERS.map((layer) => ({
  ...layer,
  src: `https://media.kamiyonstudio.com/site/hero/parallax/v1/${layer.file}`,
}));

const samplePartners: PartnerPlaceholder[] = [
  { id: "partner-1", label: "Partner placeholder" },
  { id: "partner-2", label: "Partner placeholder" },
];

function renderHero() {
  return render(
    <HeroParallaxOpening layers={layers} partners={samplePartners} />,
  );
}

/** DOM order of every parallax layer, which is what sets stacking order. */
function layerOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("[data-parallax-layer]")).map(
    (node) => node.getAttribute("data-parallax-layer") ?? "",
  );
}

beforeEach(() => {
  layeredParallaxMock.mockClear();
  partnersMarqueeMock.mockClear();
});

describe("HeroParallaxOpening", () => {
  it("keeps the opening stage contract shared with the static hero", () => {
    const { container } = renderHero();

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("id", "home-hero");
    expect(section).toHaveAttribute("data-nav-theme", "dark");
    expect(section).toHaveClass("min-h-[100svh]", "overflow-hidden");
    expect(container.querySelector("[data-opening-curtain]")).toBeInTheDocument();
    expect(
      container.querySelector("[data-testid='hero-bottom-scrim']"),
    ).toBeInTheDocument();
  });

  it("renders one plate per configured layer", () => {
    const { container } = renderHero();

    const plates = container.querySelectorAll("[data-testid^='hero-parallax-plate-']");
    expect(plates).toHaveLength(HERO_PARALLAX_LAYERS.length);

    for (const layer of HERO_PARALLAX_LAYERS) {
      const plate = container.querySelector(
        `[data-testid='hero-parallax-plate-${layer.depth}']`,
      );
      expect(plate).toBeInTheDocument();
      expect(plate?.getAttribute("src")).toContain(layer.file);
    }
  });

  it("marks plates as decorative so the wordmark carries the accessible name", () => {
    const { container } = renderHero();

    const plates = Array.from(
      container.querySelectorAll<HTMLImageElement>(
        "[data-testid^='hero-parallax-plate-']",
      ),
    );

    expect(plates).not.toHaveLength(0);
    expect(plates.every((plate) => plate.getAttribute("alt") === "")).toBe(true);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  it("stacks the wordmark behind the nearest plate so the foreground occludes it", () => {
    const { container } = renderHero();

    expect(layerOrder(container)).toEqual(["1", "2", "3", "brand", "4"]);
  });

  it("renders the wordmark and motto inside the wordmark plate", () => {
    const { container } = renderHero();

    const brandLayer = container.querySelector("[data-parallax-layer='brand']");
    expect(brandLayer).toHaveAttribute("data-testid", "hero-brand-zone");
    expect(brandLayer).toContainElement(
      screen.getByRole("heading", { level: 1, name: "KAMIYON STUDIO" }),
    );
    expect(brandLayer).toContainElement(screen.getByText(SITE_MOTTO));
  });

  it("drives every plate plus the wordmark from the layered parallax hook", () => {
    renderHero();

    expect(layeredParallaxMock).toHaveBeenCalledTimes(1);
    expect(layeredParallaxMock.mock.calls[0]?.[0]).toEqual([
      { layer: "1", yPercent: 70 },
      { layer: "2", yPercent: 55 },
      { layer: "3", yPercent: 40 },
      { layer: "4", yPercent: 10 },
      { layer: "brand", yPercent: HERO_PARALLAX_BRAND_Y_PERCENT },
    ]);
  });

  it("keeps the scrim below the wordmark so it never dims the text", () => {
    const { container } = renderHero();

    const stage = container.querySelector("[data-testid='hero-parallax-stage']");
    const children = Array.from(stage?.children ?? []);
    const scrimIndex = children.findIndex(
      (node) => node.getAttribute("data-testid") === "hero-parallax-scrim",
    );
    const brandIndex = children.findIndex(
      (node) => node.getAttribute("data-parallax-layer") === "brand",
    );

    expect(scrimIndex).toBeGreaterThanOrEqual(0);
    expect(scrimIndex).toBeLessThan(brandIndex);
  });

  it("mounts the hero scroll helper tip", () => {
    renderHero();

    expect(screen.getByTestId("hero-scroll-helper")).toBeInTheDocument();
  });

  it("mounts PartnersMarquee as a band on dark in the lower zone", () => {
    const { container } = renderHero();

    expect(partnersMarqueeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        layout: "band",
        tone: "onDark",
        eyebrow: "Trusted by",
        partners: samplePartners,
      }),
    );

    const partnersZone = container.querySelector(
      "[data-testid='hero-partners-zone']",
    );
    expect(partnersZone).toContainElement(
      screen.getByTestId("partners-marquee-mock"),
    );
  });

  it("does not render the static hero background", () => {
    const { container } = renderHero();

    expect(container.querySelector('img[src*="background.jpg"]')).toBeNull();
  });
});
