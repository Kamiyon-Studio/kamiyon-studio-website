"use client";

import Image from "next/image";
import { useRef, type JSX } from "react";

import { useGsapContext } from "@/hooks/useGsapContext";
import {
  createScrollTriggerDefaults,
  gsap,
  GSAP_ALLOW_MOTION,
  GSAP_REDUCE_MOTION,
} from "@/lib/gsap";
import { cn } from "@/lib/utils";

import "./timeline.css";

// Contract — do not diverge across streams
export type TimelineEntry = {
  key: string;
  year: string; // required YYYY; powers the year rail
  dateLabel: string; // editor-facing display, e.g. "March 2024"
  date?: string; // optional ISO date for semantic <time dateTime>
  title: string;
  body: string;
  image: { src: string; alt: string; width?: number; height?: number };
};
// Card side is derived from array order; year is editorial data, never a layout field.

export type TimelineProps = {
  heading: string;
  summary: string;
  entries: TimelineEntry[];
  className?: string;
  id?: string;
};

function uniqueYears(entries: TimelineEntry[]): string[] {
  const years: string[] = [];
  for (const entry of entries) {
    if (!years.includes(entry.year)) {
      years.push(entry.year);
    }
  }
  return years;
}

export function Timeline({
  heading,
  summary,
  entries,
  className,
  id = "timeline",
}: TimelineProps): JSX.Element {
  const rootRef = useRef<HTMLElement | null>(null);
  const years = uniqueYears(entries);
  const hasEntries = entries.length > 0;

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
          <div className="relative mt-14 lg:mt-20">
            <div
              data-timeline-track
              className="relative mx-auto max-w-5xl xl:pr-28"
            >
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
                    <li
                      key={entry.key}
                      data-timeline-side={side}
                      className="relative pl-10 md:pl-0"
                    >
                      <span
                        className="absolute top-2 left-2.5 h-3 w-3 -translate-x-1/2 rounded-full border border-[var(--color-ivory)]/40 bg-[var(--color-charcoal)] md:left-1/2"
                        aria-hidden="true"
                      />

                      <p
                        data-testid={`timeline-year-inline-${entry.key}`}
                        className="mb-3 font-display text-sm font-semibold tracking-[0.18em] text-[var(--color-ivory)]/55 uppercase xl:hidden"
                      >
                        {entry.year}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-10">
                        <article
                          className={cn(
                            "min-w-0",
                            side === "left"
                              ? "md:col-start-1 md:pr-8 md:text-right"
                              : "md:col-start-2 md:pl-8 md:text-left",
                          )}
                        >
                          <p className="text-sm font-medium tracking-wide text-[var(--color-ivory)]/60">
                            {entry.date ? (
                              <time dateTime={entry.date}>{entry.dateLabel}</time>
                            ) : (
                              <span>{entry.dateLabel}</span>
                            )}
                          </p>
                          <h3 className="mt-2 font-display text-xl font-semibold md:text-2xl">
                            {entry.title}
                          </h3>
                          <p className="mt-3 text-base leading-relaxed text-[var(--color-ivory)]/75">
                            {entry.body}
                          </p>
                          {entry.image.src ? (
                            <div
                              className={cn(
                                "relative mt-5 aspect-[16/10] w-full max-w-md overflow-hidden bg-[var(--color-charcoal)]",
                                side === "left" && "md:ml-auto",
                              )}
                            >
                              <Image
                                src={entry.image.src}
                                alt={entry.image.alt}
                                fill
                                sizes="(max-width: 768px) 100vw, 28rem"
                                className="object-cover"
                              />
                            </div>
                          ) : null}
                        </article>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <aside
              data-testid="timeline-year-rail"
              className="pointer-events-none absolute top-0 right-0 hidden h-full w-24 xl:block"
              aria-label="Years"
            >
              <div className="sticky top-1/3 space-y-6 text-right">
                {years.map((year) => (
                  <p
                    key={year}
                    className="font-display text-2xl font-bold tracking-tight text-[var(--color-ivory)]/35"
                  >
                    {year}
                  </p>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
