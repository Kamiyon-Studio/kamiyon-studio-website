"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useId, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

export type ValuesHoverExpandItem = {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

export type ValuesHoverExpandProps = {
  items: ValuesHoverExpandItem[];
  className?: string;
  /** Index of the item expanded on mount. Defaults to 0. */
  defaultActiveIndex?: number;
};

/**
 * Accordion-style strip for core values: collapsed columns show only the
 * photo; the active/hovered/focused column expands and reveals the value's
 * name and description.
 */
export function ValuesHoverExpand({
  items,
  className,
  defaultActiveIndex = 0,
}: ValuesHoverExpandProps) {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const safeDefault =
    items.length === 0
      ? null
      : Math.min(Math.max(defaultActiveIndex, 0), items.length - 1);
  const [activeIndex, setActiveIndex] = useState<number | null>(safeDefault);

  const activate = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const onStripKeyDown = useCallback(
    (index: number) => (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate(index);
      }
    },
    [activate],
  );

  if (items.length === 0) {
    return null;
  }

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: "easeInOut" as const };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.3, delay: 0.15 }
      }
      className={cn("relative w-full max-w-6xl", className)}
    >
      <div className="flex w-full items-center justify-center gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          const panelId = `${baseId}-panel-${index}`;

          return (
            <motion.div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
              aria-label={item.name}
              aria-controls={panelId}
              className="relative shrink-0 cursor-pointer overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]"
              initial={false}
              animate={{
                width: isActive ? "24rem" : "5rem",
                height: "24rem",
              }}
              transition={transition}
              onHoverStart={() => activate(index)}
              onMouseEnter={() => activate(index)}
              onFocus={() => activate(index)}
              onClick={() => activate(index)}
              onKeyDown={onStripKeyDown(index)}
            >
              <div
                className="pointer-events-none absolute inset-0 z-[1]"
                aria-hidden="true"
              >
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 768px) 70vw, 24rem"
                  className="size-full object-cover"
                />
              </div>

              <AnimatePresence>
                {isActive ? (
                  <motion.div
                    key="overlay"
                    id={panelId}
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={
                      reduceMotion ? { duration: 0 } : { duration: 0.2 }
                    }
                    className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4"
                  >
                    <p className="font-display text-lg font-semibold text-white md:text-xl">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-sm text-white/80">
                      {item.description}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
