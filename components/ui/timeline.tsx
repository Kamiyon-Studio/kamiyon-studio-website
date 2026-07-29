"use client";

import { useCallback, useEffect, useRef, useState, type JSX } from "react";

import { useCumulativeRoster } from "@/hooks/useCumulativeRoster";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useTimelineScrollSpy } from "@/hooks/useTimelineScrollSpy";
import {
  activeYearFromEntryKey,
  buildYearRail,
  type TimelineEntryV2,
  type YearRailItem,
} from "@/lib/timeline";
import {
  createScrollTriggerDefaults,
  gsap,
  GSAP_ALLOW_MOTION,
  GSAP_REDUCE_MOTION,
} from "@/lib/gsap";
import { cn } from "@/lib/utils";

import { TimelineAside } from "./timeline-aside";
import { TimelineEntryCard } from "./timeline-entry-card";
import "./timeline.css";

/** @deprecated Prefer `TimelineEntryV2` from `@/lib/timeline`. Soft landing re-export. */
export type TimelineEntry = TimelineEntryV2;

export type TimelineProps = {
  heading: string;
  summary: string;
  entries: TimelineEntryV2[];
  className?: string;
  id?: string;
};

function entryAnchorId(sectionId: string, entryKey: string): string {
  return `${sectionId}-entry-${entryKey}`;
}

export function Timeline({
  heading,
  summary,
  entries,
  className,
  id = "timeline",
}: TimelineProps): JSX.Element {
  const rootRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const hasEntries = entries.length > 0;
  const entryKeys = entries.map((entry) => entry.key);
  const rail = buildYearRail(entries);

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const activeEntryKey = useTimelineScrollSpy({
    rootRef: trackRef,
    entryKeys,
    disabled: reduceMotion || !hasEntries,
  });

  const activeYear = reduceMotion
    ? (rail[0]?.year ?? null)
    : activeYearFromEntryKey(rail, activeEntryKey);

  const roster = useCumulativeRoster({
    rootRef: trackRef,
    entries,
    revealAll: reduceMotion,
  });

  useGsapContext(
    rootRef,
    () => {
      const root = rootRef.current;
      if (!root || !hasEntries) {
        return;
      }

      const track = root.querySelector<HTMLElement>("[data-timeline-track]");
      const progress = root.querySelector<HTMLElement>("[data-timeline-progress]");
      if (!track || !progress) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(GSAP_REDUCE_MOTION, () => {
        gsap.set(progress, { scaleY: 1, transformOrigin: "top center" });
      });

      mm.add(GSAP_ALLOW_MOTION, () => {
        gsap.set(progress, { scaleY: 0, transformOrigin: "top center" });
        gsap.to(progress, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: createScrollTriggerDefaults({
            trigger: track,
            start: "top center",
            end: "bottom center",
            scrub: 0.35,
          }),
        });
      });
    },
    [hasEntries, entries.length],
  );

  const onYearSelect = useCallback(
    (item: YearRailItem) => {
      const target = document.getElementById(entryAnchorId(id, item.firstEntryKey));
      target?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    },
    [id, reduceMotion],
  );

  return (
    <section
      ref={rootRef}
      id={id}
      className={cn(
        "timeline-section bg-[var(--color-charcoal)] py-16 text-[var(--color-ivory)] md:py-24",
        className,
      )}
      aria-labelledby={`${id}-heading`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <h2
            id={`${id}-heading`}
            className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-tight"
          >
            {heading}
          </h2>
          {summary ? (
            <p className="mt-4 text-base leading-relaxed text-[var(--color-ivory)]/70 md:text-lg">
              {summary}
            </p>
          ) : null}
        </header>

        {!hasEntries ? (
          <div
            data-testid="timeline-empty"
            className="mx-auto mt-12 max-w-xl text-center text-sm text-[var(--color-ivory)]/50"
          >
            Milestones will appear here as they are published.
          </div>
        ) : (
          <>
            <nav
              aria-label="Timeline years"
              className="mt-8 flex flex-wrap justify-center gap-2 xl:hidden"
              data-testid="timeline-year-chips"
            >
              {rail.map((item) => (
                <button
                  key={item.year}
                  type="button"
                  className={cn(
                    "min-h-11 rounded-md border border-[var(--color-ivory)]/20 px-3 font-display text-sm font-semibold tracking-wide text-[var(--color-ivory)]/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sakura)]",
                    item.year === activeYear &&
                      "border-[var(--color-sakura)] text-[var(--color-ivory)] underline decoration-[var(--color-sakura)] underline-offset-4",
                  )}
                  aria-current={item.year === activeYear ? "true" : undefined}
                  onClick={() => onYearSelect(item)}
                >
                  {item.year}
                </button>
              ))}
            </nav>

            <div className="relative mt-10 grid grid-cols-1 gap-10 xl:mt-16 xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-14 lg:mt-14">
              <div ref={trackRef} data-timeline-track className="relative min-w-0">
                <div
                  className="pointer-events-none absolute top-0 bottom-0 left-4 w-px bg-[var(--color-ivory)]/15 md:left-1/2 md:-translate-x-1/2"
                  aria-hidden="true"
                >
                  <div
                    data-timeline-progress
                    className="h-full w-full origin-top scale-y-0 bg-[var(--color-ivory)]/55"
                  />
                </div>

                <ol className="relative m-0 list-none space-y-14 p-0 md:space-y-20">
                  {entries.map((entry, index) => {
                    const side = index % 2 === 0 ? "left" : "right";
                    return (
                      <TimelineEntryCard
                        key={entry.key}
                        entry={entry}
                        side={side}
                        anchorId={entryAnchorId(id, entry.key)}
                      />
                    );
                  })}
                </ol>
              </div>

              <TimelineAside
                rail={rail}
                activeYear={activeYear}
                roster={roster}
                onYearSelect={onYearSelect}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
