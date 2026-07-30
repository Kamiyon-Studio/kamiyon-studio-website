"use client";

import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { SplitText } from "@/components/ui/SplitText";
import { useOpeningAnimation } from "@/hooks/useOpeningAnimation";
import { useParallax } from "@/hooks/useParallax";
import { cn } from "@/lib/utils";

const HERO_BACKGROUND = "/assets/background.jpg";

export type PageOpeningHeroProps = {
  id: string;
  title: string;
  ariaLabel: string;
  /**
   * `full` — 100svh (About).
   * `compact` — shorter stage so content below can peek into the first viewport.
   */
  size?: "full" | "compact";
};

/**
 * Page opening — centered display title over parallax background.
 * Shared by About and Services (and any future marketing landings).
 */
export function PageOpeningHero({
  id,
  title,
  ariaLabel,
  size = "full",
}: PageOpeningHeroProps) {
  const rootRef = useOpeningAnimation<HTMLElement>();
  const parallaxRef = useParallax<HTMLDivElement>({ speed: 100 });
  const isCompact = size === "compact";

  return (
    <section
      id={id}
      ref={rootRef}
      data-nav-theme="dark"
      data-size={size}
      className={cn(
        "relative scroll-mt-0 overflow-hidden bg-[var(--color-charcoal)]",
        isCompact ? "min-h-[52svh]" : "min-h-[100svh]",
      )}
      aria-label={ariaLabel}
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div
          ref={parallaxRef}
          className="absolute inset-[-20%] will-change-transform"
        >
          <Image
            src={HERO_BACKGROUND}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_40%] opacity-90"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-charcoal)]/75 via-[var(--color-charcoal)]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-charcoal)]/55 via-transparent to-[var(--color-charcoal)]/40" />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--color-charcoal)]/70 via-[var(--color-charcoal)]/25 to-transparent",
            isCompact ? "h-24 md:h-28" : "h-36 md:h-44",
          )}
        />
      </div>

      <div
        data-opening-curtain
        className="pointer-events-none absolute inset-0 z-30 -translate-y-full bg-[var(--color-charcoal)] motion-reduce:hidden"
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative z-10 flex flex-col",
          isCompact ? "min-h-[52svh]" : "min-h-[100svh]",
        )}
      >
        <Container
          className={cn(
            "relative flex flex-1 flex-col",
            isCompact ? "py-16 md:py-20" : "py-10 md:py-14",
          )}
        >
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <SplitText
              tag="h1"
              text={title}
              className={cn(
                "font-display font-bold tracking-tight text-[var(--color-ivory)]",
                isCompact
                  ? "text-[clamp(2.25rem,6vw,4.5rem)]"
                  : "text-[clamp(2.5rem,8vw,6rem)]",
              )}
              delay={80}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </div>
        </Container>
      </div>
    </section>
  );
}
