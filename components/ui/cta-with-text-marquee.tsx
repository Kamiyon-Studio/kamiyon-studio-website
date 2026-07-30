"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { RevealImageListItem, type ImageSource } from "./reveal-images";

export type VerticalMarqueeItem = {
  /** Stable key (service slug). */
  id: string;
  /** Visible label — also the accessible name of the link. */
  label: string;
  /** Internal path, e.g. `/services/game-development`. */
  href: string;
  /** Optional pair of images for the hover reveal effect. */
  images?: [ImageSource, ImageSource];
};

type VerticalMarqueeProps = {
  children: ReactNode;
  /**
   * Non-interactive clone of `children` for the seamless loop track.
   * When omitted, `children` is duplicated (only safe for decorative content).
   */
  clone?: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
};

export function VerticalMarquee({
  children,
  clone,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 30,
}: VerticalMarqueeProps) {
  const trackClassName = cn(
    "flex shrink-0 flex-col animate-marquee-vertical motion-reduce:animate-none",
    reverse && "[animation-direction:reverse]",
    pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
  );

  return (
    <div
      className={cn("group/marquee flex flex-col overflow-hidden", className)}
      style={
        {
          "--duration": `${speed}s`,
        } as CSSProperties
      }
    >
      <div className={trackClassName}>{children}</div>
      <div className={trackClassName} aria-hidden="true">
        {clone ?? children}
      </div>
    </div>
  );
}

export type CTAWithVerticalMarqueeProps = {
  eyebrow?: string;
  heading: string;
  body: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  items: VerticalMarqueeItem[];
  /** Marquee loop duration in seconds. Default 20. */
  speed?: number;
  className?: string;
  /** Optional heading element id for aria-labelledby. */
  headingId?: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

// Base classes shared by all rows — font-black replaces the old font-light.
const rowBaseClass =
  "marquee-item block w-full py-8 text-left text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl";

// Rows without images also get colour-transition hover feedback.
const rowPlainClass = cn(
  rowBaseClass,
  "transition-colors duration-300 hover:text-sakura-ink focus-visible:text-sakura-ink",
);

// Reveal rows stay w-fit so hover images sit beside the label (not far-right).
const rowRevealClass =
  "marquee-item block w-fit py-8 text-left text-4xl tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl";

export default function CTAWithVerticalMarquee({
  eyebrow,
  heading,
  body,
  primaryCta,
  secondaryCta,
  items,
  speed = 20,
  className,
  headingId,
}: CTAWithVerticalMarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const marqueeContainer = marqueeRef.current;
    if (!marqueeContainer) {
      return;
    }

    let frameId = 0;

    const updateOpacity = () => {
      const containerRect = marqueeContainer.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;
      const maxDistance = containerRect.height / 2 || 1;
      const nodes = marqueeContainer.querySelectorAll(".marquee-item");

      nodes.forEach((node) => {
        const itemRect = node.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(centerY - itemCenterY);
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const opacity = 1 - normalizedDistance * 0.75;
        (node as HTMLElement).style.opacity = opacity.toString();
      });
    };

    const tick = () => {
      updateOpacity();
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [prefersReducedMotion, items]);

  if (items.length === 0) {
    return null;
  }

  // Interactive track: links (or reveal items) the user can click.
  const interactiveRows = items.map((item) => {
    if (item.images) {
      return (
        <RevealImageListItem
          key={item.id}
          text={item.label}
          images={item.images}
          href={item.href}
          className={rowRevealClass}
        />
      );
    }
    return (
      <Link key={item.id} href={item.href} className={rowPlainClass}>
        {item.label}
      </Link>
    );
  });

  // Clone track: aria-hidden, non-interactive mirror for the seamless loop.
  const cloneRows = items.map((item) => {
    if (item.images) {
      return (
        <RevealImageListItem
          key={`clone-${item.id}`}
          text={item.label}
          images={item.images}
          decorative
          className={rowRevealClass}
        />
      );
    }
    return (
      <span key={`clone-${item.id}`} className={rowBaseClass}>
        {item.label}
      </span>
    );
  });

  return (
    <div
      className={cn(
        "overflow-hidden bg-background px-0 py-0 text-foreground",
        className,
      )}
    >
      <div className="w-full max-w-7xl animate-fade-in-up">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="max-w-xl space-y-8">
            {eyebrow ? (
              <p className="animate-fade-in-up text-sm font-semibold uppercase tracking-wide text-sakura-ink">
                {eyebrow}
              </p>
            ) : null}
            <h2
              id={headingId}
              className="animate-fade-in-up font-display text-5xl font-medium leading-tight tracking-tight text-foreground [animation-delay:200ms] md:text-6xl lg:text-7xl"
            >
              {heading}
            </h2>
            <p className="animate-fade-in-up text-lg leading-relaxed text-muted-foreground [animation-delay:400ms] md:text-xl">
              {body}
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up [animation-delay:600ms]">
              <Button href={primaryCta.href} variant="primary" size="lg">
                {primaryCta.label}
              </Button>
              <Button href={secondaryCta.href} variant="secondary" size="lg">
                {secondaryCta.label}
              </Button>
            </div>
          </div>

          <div
            ref={marqueeRef}
            className="relative flex h-[600px] items-center justify-center animate-fade-in-up [animation-delay:400ms] lg:h-[700px]"
          >
            <div className="relative h-full w-full">
              {prefersReducedMotion ? (
                <ul className="flex h-full flex-col justify-center gap-2 overflow-y-auto py-8">
                  {items.map((item) => (
                    <li key={item.id}>
                      {item.images ? (
                        <RevealImageListItem
                          text={item.label}
                          images={item.images}
                          href={item.href}
                          className="marquee-item block w-full py-4 text-left text-3xl tracking-tight text-foreground md:text-4xl"
                        />
                      ) : (
                        <Link
                          href={item.href}
                          className="marquee-item block w-full py-4 text-left text-3xl font-black tracking-tight text-foreground transition-colors hover:text-sakura-ink md:text-4xl"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <VerticalMarquee
                  speed={speed}
                  pauseOnHover
                  className="h-full"
                  clone={cloneRows}
                >
                  {interactiveRows}
                </VerticalMarquee>
              )}

              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-64 bg-gradient-to-b from-background via-background/50 to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-64 bg-gradient-to-t from-background via-background/50 to-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
