"use client";

import Image from "next/image";

import { HeroBrand } from "@/components/sections/HeroBrand";
import { HeroScrollHelper } from "@/components/sections/HeroScrollHelper";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";
import {
  useLayeredParallax,
  type ParallaxLayerMotion,
} from "@/hooks/useLayeredParallax";
import { useOpeningAnimation } from "@/hooks/useOpeningAnimation";
import {
  HERO_PARALLAX_BRAND_Y_PERCENT,
  HERO_PARALLAX_LAYER_HEIGHT,
  HERO_PARALLAX_LAYER_WIDTH,
  splitHeroParallaxLayers,
  type ResolvedHeroParallaxLayer,
} from "@/lib/home/hero-parallax-layers";
import type { PartnerPlaceholder } from "@/lib/home/partner-placeholders";

type HeroParallaxOpeningProps = {
  layers: ResolvedHeroParallaxLayer[];
  partners: PartnerPlaceholder[];
};

/** `data-parallax-layer` value for the wordmark plate. */
const BRAND_LAYER = "brand";

/**
 * Plates overhang the stage on both ends so the scrubbed travel never drags an
 * edge into view, and every plate shares one crop so they stay in register.
 */
const PLATE_CLASS =
  "pointer-events-none absolute -top-[18%] left-0 h-[118%] w-full max-w-none object-cover object-[center_62%] will-change-transform";

/** Plates are 1024px wide; asking for more would only upscale the source. */
const PLATE_SIZES = "(max-width: 1024px) 100vw, 1024px";

/**
 * Halo behind the wordmark. `closest-side` puts the gradient's transparent stop
 * exactly on the nearest box edge, so the scrim's rectangle never shows up as a
 * seam over the artwork the way a `farthest-corner` ellipse does.
 */
const BRAND_SCRIM_CLASS =
  "pointer-events-none absolute -inset-x-[24%] -inset-y-[70%] -z-10 bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-charcoal)_88%,transparent)_0%,color-mix(in_srgb,var(--color-charcoal)_52%,transparent)_45%,transparent_100%)]";

function ParallaxPlate({ layer }: { layer: ResolvedHeroParallaxLayer }) {
  return (
    <Image
      src={layer.src}
      alt=""
      width={HERO_PARALLAX_LAYER_WIDTH}
      height={HERO_PARALLAX_LAYER_HEIGHT}
      sizes={PLATE_SIZES}
      // The scene only reads correctly once every plate has arrived.
      priority
      data-parallax-layer={String(layer.depth)}
      data-testid={`hero-parallax-plate-${layer.depth}`}
      className={PLATE_CLASS}
    />
  );
}

/**
 * Full-bleed opening stage built from stacked R2 plates that drift apart on
 * scroll. Content matches the static opening: wordmark + motto upper, partners
 * band lower. The wordmark is itself a plate, so the foreground rocks rise over
 * it as the hero exits.
 */
export function HeroParallaxOpening({ layers, partners }: HeroParallaxOpeningProps) {
  const rootRef = useOpeningAnimation<HTMLElement>();
  const { behindBrand, inFrontOfBrand } = splitHeroParallaxLayers(layers);

  const layerMotions: ParallaxLayerMotion[] = [
    ...layers.map(({ depth, yPercent }) => ({ layer: String(depth), yPercent })),
    { layer: BRAND_LAYER, yPercent: HERO_PARALLAX_BRAND_Y_PERCENT },
  ];
  const stageRef = useLayeredParallax<HTMLDivElement>(layerMotions);

  return (
    <section
      id="home-hero"
      ref={rootRef}
      data-nav-theme="dark"
      data-testid="hero-parallax-opening"
      className="relative min-h-[100svh] scroll-mt-0 overflow-hidden bg-[var(--color-charcoal)]"
      aria-label="Studio opening"
    >
      <div
        ref={stageRef}
        data-parallax-layers
        data-testid="hero-parallax-stage"
        className="absolute inset-0"
      >
        {behindBrand.map((layer) => (
          <ParallaxPlate key={layer.depth} layer={layer} />
        ))}

        {/* Under the wordmark on purpose: darkens the sky, never the text. */}
        <div
          data-testid="hero-parallax-scrim"
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[var(--color-charcoal)]/75 via-[var(--color-charcoal)]/25 to-transparent"
        />

        <div
          data-parallax-layer={BRAND_LAYER}
          data-testid="hero-brand-zone"
          className="absolute inset-x-0 top-0 flex h-[100svh] flex-col items-center justify-center px-6 pb-[22vh] text-center will-change-transform"
        >
          <div className="relative isolate flex flex-col items-center">
            {/*
              Travels with the wordmark rather than the stage, so the motto keeps
              its contrast wherever the scrub happens to put it over the artwork.
            */}
            <div
              data-testid="hero-brand-scrim"
              aria-hidden="true"
              className={BRAND_SCRIM_CLASS}
            />
            <HeroBrand />
          </div>
        </div>

        {inFrontOfBrand.map((layer) => (
          <ParallaxPlate key={layer.depth} layer={layer} />
        ))}
      </div>

      {/*
        Bottom scrim — logo legibility only, not a section handoff. Reaches
        further and darker than the static hero's because the foreground plate
        puts lit rock and water directly behind the partner band.
      */}
      <div
        data-testid="hero-bottom-scrim"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--color-charcoal)]/95 via-[var(--color-charcoal)]/60 to-transparent md:h-56"
      />

      <div
        data-opening-curtain
        className="pointer-events-none absolute inset-0 z-30 -translate-y-full bg-[var(--color-charcoal)] motion-reduce:hidden"
        aria-hidden="true"
      />

      <div
        data-testid="hero-parallax-layout"
        className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col"
      >
        <HeroScrollHelper />
        {/* Spacer: the wordmark lives in the plate stack, not in this column. */}
        <div className="flex-1" aria-hidden="true" />
        <div
          data-testid="hero-partners-zone"
          className="pointer-events-auto w-full shrink-0 pb-6 md:pb-8"
        >
          <PartnersMarquee
            layout="band"
            tone="onDark"
            eyebrow="Trusted by"
            partners={partners}
          />
        </div>
      </div>
    </section>
  );
}
