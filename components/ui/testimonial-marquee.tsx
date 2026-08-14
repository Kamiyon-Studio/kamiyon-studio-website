"use client";

import { motion, useAnimationControls } from "motion/react";
import Image from "next/image";
import { useEffect } from "react";

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

const COLUMN_DURATIONS_S = [15, 19, 17] as const;
const COLUMN_VISIBILITY = ["", "hidden md:block", "hidden lg:block"] as const;

const CARD_LIFT = {
  scale: 1.03,
  y: -8,
  boxShadow: "var(--shadow-lg)",
};
const CARD_SPRING = { type: "spring" as const, stiffness: 400, damping: 17 };

const cardChromeClassName = cn(
  "group flex h-full w-full max-w-xs flex-col rounded-[var(--radius-card-lg)]",
  "border border-[var(--border-default)] bg-[var(--bg-surface)] p-10",
  "shadow-[var(--shadow-lg)]",
);

const avatarClassName = cn(
  "h-10 w-10 shrink-0 rounded-full object-cover ring-2",
  "ring-[var(--border-default)] group-hover:ring-[var(--color-sakura)]",
);

const scrollerClassName = cn(
  "flex max-h-[740px] justify-center gap-6 overflow-hidden",
  "[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]",
  "[-webkit-mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]",
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

function chunkColumns(
  items: TestimonialMarqueeItem[],
): [
  TestimonialMarqueeItem[],
  TestimonialMarqueeItem[],
  TestimonialMarqueeItem[],
] {
  return [items.slice(0, 3), items.slice(3, 6), items.slice(6, 9)];
}

function startMarqueeLoop(
  controls: ReturnType<typeof useAnimationControls>,
  durationS: number,
) {
  return controls.start({
    translateY: "-50%",
    transition: {
      duration: durationS,
      repeat: Infinity,
      ease: "linear",
      repeatType: "loop",
    },
  });
}

function TestimonialAvatar({ item }: { item: TestimonialMarqueeItem }) {
  const rawSrc = item.photoUrl?.trim() ?? "";
  const photoSrc = rawSrc && isAllowedNextImageSrc(rawSrc) ? rawSrc : null;

  if (photoSrc) {
    return (
      <Image
        src={photoSrc}
        alt={item.photoAlt?.trim() || item.name}
        width={40}
        height={40}
        className={avatarClassName}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        avatarClassName,
        "flex items-center justify-center bg-[var(--bg-accent)] text-sm font-semibold text-sakura-ink",
      )}
    >
      {initialsFromName(item.name)}
    </span>
  );
}

function TestimonialCardBody({ item }: { item: TestimonialMarqueeItem }) {
  return (
    <figure className={cardChromeClassName}>
      <blockquote className="m-0">
        <p className="leading-relaxed text-[var(--text-secondary)]">{item.quote}</p>
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <TestimonialAvatar item={item} />
        <div className="min-w-0">
          <p className="font-semibold text-[var(--text-primary)]">{item.name}</p>
          {item.role ? (
            <p className="text-sm text-[var(--text-muted)]">{item.role}</p>
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
}: {
  item: TestimonialMarqueeItem;
  interactive: boolean;
  enableHover: boolean;
  inert?: boolean;
}) {
  const lift = enableHover && !inert ? CARD_LIFT : undefined;

  return (
    <motion.li
      aria-hidden={inert ? true : undefined}
      inert={inert || undefined}
      tabIndex={interactive && !inert ? 0 : -1}
      whileHover={lift}
      whileFocus={lift}
      transition={CARD_SPRING}
      className="list-none"
    >
      <TestimonialCardBody item={item} />
    </motion.li>
  );
}

function StaticCards({ items }: { items: TestimonialMarqueeItem[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap justify-center gap-6 p-0">
      {items.map((item) => (
        <li key={item.id} className="list-none">
          <TestimonialCardBody item={item} />
        </li>
      ))}
    </ul>
  );
}

function MarqueeColumn({
  items,
  durationS,
  col,
  className,
}: {
  items: TestimonialMarqueeItem[];
  durationS: number;
  col: 0 | 1 | 2;
  className?: string;
}) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    void startMarqueeLoop(controls, durationS);

    return () => {
      controls.stop();
    };
  }, [controls, durationS, items.length]);

  const pause = () => {
    controls.stop();
  };

  const resume = () => {
    if (items.length === 0) {
      return;
    }
    void startMarqueeLoop(controls, durationS);
  };

  return (
    <div
      data-testid="testimonial-marquee-col"
      data-col={String(col)}
      className={className}
      onFocus={pause}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          resume();
        }
      }}
    >
      {items.length === 0 ? null : (
        <motion.ul
          animate={controls}
          onHoverStart={pause}
          onHoverEnd={resume}
          className="m-0 flex list-none flex-col gap-6 p-0"
        >
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
        </motion.ul>
      )}
    </div>
  );
}

function MarqueeScroller({ items }: { items: TestimonialMarqueeItem[] }) {
  const columns = chunkColumns(items);

  return (
    <div
      data-testid="testimonial-marquee-scroller"
      className={scrollerClassName}
    >
      {columns.map((columnItems, index) =>
        columnItems.length === 0 ? null : (
          <MarqueeColumn
            key={index}
            items={columnItems}
            durationS={COLUMN_DURATIONS_S[index] ?? COLUMN_DURATIONS_S[0]}
            col={index as 0 | 1 | 2}
            className={COLUMN_VISIBILITY[index]}
          />
        ),
      )}
    </div>
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

  return (
    <div
      data-testid="testimonial-marquee"
      data-mode={reducedMotion ? "static" : "marquee"}
      className={className}
    >
      {reducedMotion ? (
        <StaticCards items={items} />
      ) : (
        <MarqueeScroller items={items} />
      )}
    </div>
  );
}
