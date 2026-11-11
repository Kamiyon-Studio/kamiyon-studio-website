"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { HeroBrand } from "@/components/sections/HeroBrand";
import { HeroScrollHelper } from "@/components/sections/HeroScrollHelper";
import { useOpeningAnimation } from "@/hooks/useOpeningAnimation";
import {
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

/** Keep the media anchored to the section without scroll-linked transforms. */
const PLATE_CLASS =
  "pointer-events-none absolute inset-x-0 top-0 h-full w-full max-w-none";

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

const subscribeHydration = () => () => {};

function ParallaxPlate({
  layer,
  paused,
}: {
  layer: ResolvedHeroParallaxLayer;
  paused: boolean;
}) {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = hydrated && !reduceMotion && Boolean(layer.mp4Src);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let visible = true;
    const sync = () => {
      if (paused || document.hidden || !visible) video.pause();
      else void video.play().catch(() => {});
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [hasVideo, paused]);

  return (
    <div
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
          preload="none"
          aria-hidden="true"
          disablePictureInPicture
          ref={(video) => {
            videoRef.current = video;
            muteHeroParallaxVideo(video);
          }}
        >
          {layer.webmSrc ? (
            <source src={layer.webmSrc} type="video/webm" />
          ) : null}
          <source src={layer.mp4Src} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}

/** Full-bleed video opening that scrolls with normal document flow. */
export function HeroParallaxOpening({ layers }: HeroParallaxOpeningProps) {
  const rootRef = useOpeningAnimation<HTMLElement>();
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const { behindBrand, inFrontOfBrand } = splitHeroParallaxLayers(layers);

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
        data-testid="hero-parallax-stage"
        className="absolute inset-0"
      >
        {behindBrand.map((layer) => (
          <ParallaxPlate key={layer.depth} layer={layer} paused={paused} />
        ))}

        {/* Under the wordmark on purpose: darkens the sky, never the text. */}
        <div
          data-testid="hero-parallax-scrim"
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[var(--color-charcoal)]/75 via-[var(--color-charcoal)]/25 to-transparent"
        />

        <div
          data-testid="hero-brand-zone"
          className="absolute inset-x-0 top-0 flex h-[100svh] flex-col items-center justify-center px-6 pb-[22vh] text-center"
        >
          <HeroBrand />
        </div>

        {inFrontOfBrand.map((layer) => (
          <ParallaxPlate key={layer.depth} layer={layer} paused={paused} />
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
        {!reduceMotion && layers.some((layer) => layer.mp4Src) ? (
          <button
            type="button"
            className="pointer-events-auto absolute bottom-6 left-6 min-h-11 rounded border border-white/50 bg-black/60 px-4 py-2 text-sm text-white"
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused
              ? "Resume background animation"
              : "Pause background animation"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
