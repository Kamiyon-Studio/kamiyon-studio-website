"use client";

import Image from "next/image";
import type { CSSProperties, JSX } from "react";

import { Marquee } from "@/components/ui/3d-testimonials";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { isAllowedNextImageSrc } from "@/lib/cms/image";
import { cn } from "@/lib/utils";

export type TestimonialMarqueeItem = {
  id: string;
  quote: string;
  name: string;
  role?: string;
  photoUrl?: string | null;
  photoAlt?: string;
};

export type TestimonialMarqueeProps = {
  items: TestimonialMarqueeItem[];
  className?: string;
};

const COLUMN_COUNT = 4;
const COLUMN_REPEAT = 3;
const COLUMN_VISIBILITY = [
  "",
  "",
  "hidden md:block",
  "hidden lg:block",
] as const;
const COLUMN_DURATIONS = ["40s", "48s", "36s", "44s"] as const;

const SCENE_TRANSFORM =
  "translateX(0px) translateY(0px) translateZ(0px) rotateX(16deg) rotateY(-4deg) rotateZ(4deg) scale(1.28)";

/** First letters of up to two name words, e.g. "Fixture Author" → "FA". */
export function initialsFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function TestimonialAvatar({ item }: { item: TestimonialMarqueeItem }) {
  const rawSrc = item.photoUrl?.trim() ?? "";
  const photoSrc = rawSrc && isAllowedNextImageSrc(rawSrc) ? rawSrc : null;

  return (
    <Avatar className="size-11">
      {photoSrc ? (
        <Image
          src={photoSrc}
          alt={item.photoAlt?.trim() || item.name}
          width={44}
          height={44}
          className="aspect-square size-full object-cover"
        />
      ) : (
        <AvatarFallback className="bg-[var(--bg-accent)] text-sm font-semibold text-sakura-ink">
          {initialsFromName(item.name)}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

function TestimonialCard({ item }: { item: TestimonialMarqueeItem }) {
  return (
    <Card className="w-64 border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)] md:w-72">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <TestimonialAvatar item={item} />
          <div className="flex min-w-0 flex-col">
            <figcaption className="flex items-center gap-1 text-sm font-medium text-foreground md:text-base">
              {item.name}
            </figcaption>
            {item.role ? (
              <p className="text-xs font-medium text-muted-foreground md:text-sm">
                {item.role}
              </p>
            ) : null}
          </div>
        </div>
        <blockquote className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
          {item.quote}
        </blockquote>
      </CardContent>
    </Card>
  );
}

function StaticCards({ items }: { items: TestimonialMarqueeItem[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap justify-center gap-6 p-0">
      {items.map((item) => (
        <li key={item.id} className="list-none">
          <TestimonialCard item={item} />
        </li>
      ))}
    </ul>
  );
}

function MarqueeColumn({
  items,
  col,
  className,
}: {
  items: TestimonialMarqueeItem[];
  col: number;
  className?: string;
}) {
  return (
    <div
      data-testid="testimonial-marquee-col"
      data-col={String(col)}
      className={className}
    >
      <Marquee
        vertical
        pauseOnHover
        reverse={col % 2 === 1}
        repeat={COLUMN_REPEAT}
        className="h-full p-0"
        style={{ "--duration": COLUMN_DURATIONS[col] } as CSSProperties}
        ariaRole="presentation"
        tabIndex={-1}
      >
        {items.map((item) => (
          <TestimonialCard key={item.id} item={item} />
        ))}
      </Marquee>
    </div>
  );
}

function MarqueeScroller({ items }: { items: TestimonialMarqueeItem[] }) {
  return (
    <div
      data-testid="testimonial-marquee-scroller"
      className="absolute -top-[20%] left-0 right-0 flex h-[140%] origin-center flex-row items-center justify-center gap-5 md:gap-8"
      style={{ transform: SCENE_TRANSFORM }}
    >
      {Array.from({ length: COLUMN_COUNT }, (_, index) => (
        <MarqueeColumn
          key={index}
          items={items}
          col={index}
          className={cn("h-full", COLUMN_VISIBILITY[index])}
        />
      ))}
    </div>
  );
}

export function TestimonialMarquee({
  items,
  className,
}: TestimonialMarqueeProps): JSX.Element | null {
  const reducedMotion = useReducedMotion();

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="testimonial-marquee"
      data-mode={reducedMotion ? "static" : "marquee"}
      className={cn(
        reducedMotion
          ? cn(
              "flex min-h-[100svh] w-full items-center justify-center px-4 py-24",
              className,
            )
          : cn(
              "relative flex h-[100svh] min-h-[100svh] w-full flex-row items-center justify-center overflow-hidden px-4 sm:px-6",
              "[perspective:700px]",
              className,
            ),
      )}
    >
      {reducedMotion ? (
        <StaticCards items={items} />
      ) : (
        <>
          <MarqueeScroller items={items} />
          <div
            data-testid="testimonial-marquee-fade-top"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/3 bg-gradient-to-b from-[var(--bg-primary)]"
          />
          <div
            data-testid="testimonial-marquee-fade-bottom"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/4 bg-gradient-to-t from-[var(--bg-primary)]"
          />
        </>
      )}
    </div>
  );
}
