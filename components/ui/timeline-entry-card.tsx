"use client";

import { useState, type JSX } from "react";

import type { TimelineEntryV2 } from "@/lib/timeline";
import { cn } from "@/lib/utils";

import { TimelineEntryMedia } from "./timeline-entry-media";

export type TimelineEntryCardProps = {
  entry: TimelineEntryV2;
  side: "left" | "right";
  /** WS-D scrolls to this id; WS-E supplies it. */
  anchorId?: string;
  className?: string;
};

export function TimelineEntryCard({
  entry,
  side,
  anchorId,
  className,
}: TimelineEntryCardProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const isJoin = entry.entryType === "teamJoin";

  return (
    <li
      id={anchorId}
      data-timeline-entry-key={entry.key}
      data-timeline-year={entry.year}
      data-timeline-entry-type={entry.entryType}
      {...(isJoin && entry.rosterMember
        ? { "data-timeline-roster-id": entry.rosterMember.id }
        : {})}
      data-timeline-side={side}
      className={cn("relative pl-10 md:pl-0", className)}
    >
      <span className="timeline-spine-node" aria-hidden="true" />

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
              ? "md:col-start-1 timeline-zone-gutter-left md:text-right"
              : "md:col-start-2 timeline-zone-gutter-right md:text-left",
          )}
        >
          <div
            className={cn(
              "hidden xl:block",
              side === "left" ? "md:float-right md:ml-4" : "md:float-left md:mr-4",
            )}
          >
            <p className="timeline-date-vertical font-display text-xs font-semibold uppercase text-[var(--color-ivory)]/45">
              {entry.dateLabel}
            </p>
          </div>

          <p className="text-sm font-medium tracking-wide text-[var(--color-ivory)]/60">
            {entry.date ? (
              <time dateTime={entry.date}>{entry.dateLabel}</time>
            ) : (
              <span>{entry.dateLabel}</span>
            )}
          </p>

          {isJoin && entry.rosterMember?.role ? (
            <p
              className="mt-2 text-xs font-semibold tracking-[0.14em] text-[var(--color-sakura)] uppercase"
              data-testid={`timeline-role-eyebrow-${entry.key}`}
            >
              {entry.rosterMember.role}
            </p>
          ) : null}

          <h3
            className={cn(
              "mt-2 font-display text-xl font-semibold md:text-2xl",
              isJoin && "uppercase",
            )}
          >
            {entry.title}
          </h3>

          <p
            className={cn(
              "mt-3 text-base leading-relaxed text-[var(--color-ivory)]/75",
              !expanded && "line-clamp-3",
            )}
          >
            {entry.body}
          </p>

          <button
            type="button"
            className="mt-2 min-h-11 text-sm font-medium text-[var(--color-ivory)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sakura)]"
            aria-expanded={expanded}
            aria-label={
              expanded
                ? `Read less about ${entry.title}`
                : `Read more about ${entry.title}`
            }
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Read less" : "Read more"}
          </button>

          <TimelineEntryMedia
            images={entry.images}
            entryKey={entry.key}
            className={cn("mt-5", side === "left" && "md:ml-auto")}
          />
        </article>
      </div>
    </li>
  );
}
