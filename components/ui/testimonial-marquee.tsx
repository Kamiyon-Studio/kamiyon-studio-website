"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { type CSSProperties } from "react";

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

const COLUMN_COUNT = 3;
const COLUMN_DURATIONS_S = [10, 15, 20] as const;

const CARD_LIFT = { scale: 1.03, y: -8 };
const CARD_SPRING = { type: "spring" as const, stiffness: 400, damping: 22 };

const cardChromeClassName = cn(
  "flex h-full flex-col rounded-[var(--radius-card-lg)] border border-[var(--border-default)]",
  "bg-[var(--bg-surface)] p-8 shadow-[var(--shadow-lg)]",
);

const trackClassName = cn(
  "flex shrink-0 flex-col gap-4 animate-marquee-vertical motion-reduce:animate-none",
  "group-hover/track:[animation-play-state:paused]",
  "group-focus-within/track:[animation-play-state:paused]",
);

const columnMaskClassName = cn(
  "group/track relative h-[32rem] overflow-hidden",
  "[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]",
  "[-webkit-mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]",
);

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

function splitRoundRobin(
  items: TestimonialMarqueeItem[],
  columnCount: number,
): TestimonialMarqueeItem[][] {
  const columns: TestimonialMarqueeItem[][] = Array.from(
    { length: columnCount },
    () => [],
  );

  items.forEach((item, index) => {
    columns[index % columnCount]?.push(item);
  });

  return columns.filter((column) => column.length > 0);
}

function TestimonialAvatar({ item }: { item: TestimonialMarqueeItem }) {
  const rawSrc = item.photoUrl?.trim() ?? "";
  const photoSrc = rawSrc && isAllowedNextImageSrc(rawSrc) ? rawSrc : null;

  if (photoSrc) {
    return (
      <Image
        src={photoSrc}
        alt={item.photoAlt?.trim() || item.name}
        width={48}
        height={48}
        className="size-12 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--bg-accent)] text-sm font-semibold text-sakura-ink"
    >
      {initialsFromName(item.name)}
    </span>
  );
}

function TestimonialCardBody({ item }: { item: TestimonialMarqueeItem }) {
  return (
    <figure className={cardChromeClassName}>
      <blockquote className="m-0">
        <p className="font-body text-base leading-relaxed text-[var(--text-primary)]">
          {item.quote}
        </p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <TestimonialAvatar item={item} />
        <div className="min-w-0">
          <p className="font-semibold text-[var(--text-primary)]">{item.name}</p>
          {item.role ? (
            <p className="text-sm text-[var(--text-secondary)]">{item.role}</p>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
}

function TestimonialCard({
  item,
  interactive,
  enableHover,
  inert = false,
  className,
}: {
  item: TestimonialMarqueeItem;
  interactive: boolean;
  enableHover: boolean;
  /** Clone-track cards: hide from AT, no focus. */
  inert?: boolean;
  className?: string;
}) {
  const lift = enableHover && !inert ? CARD_LIFT : undefined;

  return (
    <motion.li
      aria-hidden={inert ? true : undefined}
      tabIndex={interactive && !inert ? 0 : -1}
      whileHover={lift}
      whileFocus={lift}
      transition={CARD_SPRING}
      className={cn("list-none", className)}
    >
      <TestimonialCardBody item={item} />
    </motion.li>
  );
}

function StaticCards({
  items,
  enableHover,
}: {
  items: TestimonialMarqueeItem[];
  enableHover: boolean;
}) {
  return (
    <ul className="m-0 flex list-none flex-wrap justify-center gap-6 p-0">
      {items.map((item) => (
        <TestimonialCard
          key={item.id}
          item={item}
          interactive
          enableHover={enableHover}
          className={items.length === 1 ? "w-full max-w-md" : "w-full max-w-sm"}
        />
      ))}
    </ul>
  );
}

function MarqueeColumn({
  items,
  durationS,
}: {
  items: TestimonialMarqueeItem[];
  durationS: number;
}) {
  return (
    <div
      className={columnMaskClassName}
      style={{ "--duration": `${durationS}s` } as CSSProperties}
    >
      {/* One track containing primary + clone so translateY(-50%) loops cleanly. */}
      <ul className={cn("m-0 list-none p-0", trackClassName)}>
        {items.map((item) => (
          <TestimonialCard
            key={item.id}
            item={item}
            interactive
            enableHover
          />
        ))}
        {items.map((item) => (
          <TestimonialCard
            key={`${item.id}-clone`}
            item={item}
            interactive={false}
            enableHover={false}
            inert
          />
        ))}
      </ul>
    </div>
  );
}

function MarqueeColumnRow({
  items,
  columnCount,
}: {
  items: TestimonialMarqueeItem[];
  columnCount: 1 | 2 | 3;
}) {
  const columns = splitRoundRobin(items, columnCount);

  return (
    <div
      className={cn(
        "gap-4 md:gap-6",
        columnCount === 1 && "grid grid-cols-1",
        columnCount === 2 && "grid grid-cols-2",
        columnCount === 3 && "grid grid-cols-3",
      )}
    >
      {columns.map((columnItems, index) => (
        <MarqueeColumn
          key={`${columnCount}-${columnItems[0]?.id ?? index}`}
          items={columnItems}
          durationS={COLUMN_DURATIONS_S[index] ?? COLUMN_DURATIONS_S[0]}
        />
      ))}
    </div>
  );
}

function MarqueeTracks({ items }: { items: TestimonialMarqueeItem[] }) {
  return (
    <>
      <div className="md:hidden">
        <MarqueeColumnRow items={items} columnCount={1} />
      </div>
      <div className="hidden md:block lg:hidden">
        <MarqueeColumnRow items={items} columnCount={2} />
      </div>
      <div className="hidden lg:block">
        <MarqueeColumnRow items={items} columnCount={COLUMN_COUNT} />
      </div>
    </>
  );
}

export function TestimonialMarquee({
  items,
  className,
}: TestimonialMarqueeProps): React.JSX.Element | null {
  const reducedMotion = useReducedMotion();

  if (items.length === 0) {
    return null;
  }

  const useMarquee = items.length >= 3 && !reducedMotion;

  return (
    <div
      data-testid="testimonial-marquee"
      data-mode={useMarquee ? "marquee" : "static"}
      className={className}
    >
      {useMarquee ? (
        <MarqueeTracks items={items} />
      ) : (
        <StaticCards items={items} enableHover={!reducedMotion} />
      )}
    </div>
  );
}
