"use client";

import Image from "next/image";

import { HeroBrand } from "@/components/sections/HeroBrand";
import { HeroScrollHelper } from "@/components/sections/HeroScrollHelper";
import {
  useLayeredParallax,
  type ParallaxLayerMotion,
} from "@/hooks/useLayeredParallax";
import { useOpeningAnimation } from "@/hooks/useOpeningAnimation";
import {
  HERO_PARALLAX_BRAND_Y_PERCENT,
  HERO_PARALLAX_LAYER_HEIGHT,
  HERO_PARALLAX_LAYER_WIDTH,
  HERO_PROJECTS_SEAM_SVH,
  heroProjectsSeamOverlayStyle,
  splitHeroParallaxLayers,
  type ResolvedHeroParallaxLayer,
} from "@/lib/home/hero-parallax-layers";

type HeroParallaxOpeningProps = {
  layers: ResolvedHeroParallaxLayer[];
};

/** `data-parallax-layer` value for the wordmark plate. */
const BRAND_LAYER = "brand";

/**
 * Plates fill the stage from the top so the sky sits on the viewport edge.
 * Extra height for parallax travel is not applied upward — that was cropping
 * the top of the landscape.
 */
const PLATE_CLASS =
  "pointer-events-none absolute inset-x-0 top-0 h-full w-full max-w-none will-change-transform";

const PLATE_MEDIA_CLASS =
  "absolute inset-0 h-full w-full max-w-none object-cover object-top";

/** Plates are 1920px wide; asking for more would only upscale the source. */
const PLATE_SIZES = "(max-width: 1920px) 100vw, 1920px";

function muteHeroParallaxVideo(video: HTMLVideoElement | null): void {
  if (!video) {
    return;
  }

  video.muted = true;
  video.defaultMuted = true;
}

function ParallaxPlate({ layer }: { layer: ResolvedHeroParallaxLayer }) {
  const hasVideo = Boolean(layer.mp4Src);

  return (
    <div
      data-parallax-layer={String(layer.depth)}
      data-testid={`hero-parallax-plate-${layer.depth}`}
      className={PLATE_CLASS}
    >
      <Image
        src={layer.src}
        alt=""
        width={HERO_PARALLAX_LAYER_WIDTH}
        height={HERO_PARALLAX_LAYER_HEIGHT}
        sizes={PLATE_SIZES}
        // The scene only reads correctly once every plate has arrived.
        priority
        className={PLATE_MEDIA_CLASS}
      />
      {hasVideo ? (
        <video
          className={`${PLATE_MEDIA_CLASS} bg-transparent motion-reduce:hidden`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          disablePictureInPicture
          ref={muteHeroParallaxVideo}
        >
          {layer.webmSrc ? <source src={layer.webmSrc} type="video/webm" /> : null}
          <source src={layer.mp4Src} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}

/**
 * Full-bleed opening stage built from stacked R2 plates that drift apart on
 * scroll. Content matches the static opening: wordmark + motto. The foreground
 * plate is planted (no extra travel). Bottom padding hangs the cliff into
 * Recent Projects so the earth plate can tuck under it.
 */
export function HeroParallaxOpening({
  layers,
}: HeroParallaxOpeningProps) {
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
      className="relative z-10 min-h-[100svh] scroll-mt-0 overflow-hidden bg-[var(--color-charcoal)]"
      style={{ paddingBottom: `${HERO_PROJECTS_SEAM_SVH}svh` }}
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
          <HeroBrand />
        </div>

        {inFrontOfBrand.map((layer) => (
          <ParallaxPlate key={layer.depth} layer={layer} />
        ))}

        <div
          data-testid="hero-projects-seam"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1]"
          style={heroProjectsSeamOverlayStyle()}
        />
      </div>

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
      </div>
    </section>
  );
}
