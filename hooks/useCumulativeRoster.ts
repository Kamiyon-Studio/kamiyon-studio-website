"use client";

import { useEffect, useState } from "react";

import {
  buildCumulativeRoster,
  buildFullRoster,
  type RosterMember,
  type TimelineEntryV2,
} from "@/lib/timeline";

export type UseCumulativeRosterOptions = {
  rootRef: React.RefObject<HTMLElement | null>;
  entries: readonly TimelineEntryV2[];
  /** true → all members immediately (reduced motion). */
  revealAll?: boolean;
  /** true → never remove members on scroll-up. Default false. */
  monotonic?: boolean;
};

/**
 * Observes teamJoin cards and returns roster members whose cards have passed
 * the reveal line, in timeline order.
 */
export function useCumulativeRoster(
  options: UseCumulativeRosterOptions,
): RosterMember[] {
  const { rootRef, entries, revealAll = false, monotonic = false } = options;
  const [passedKeys, setPassedKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (revealAll) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>('[data-timeline-entry-type="teamJoin"]'),
    );

    if (nodes.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (observerEntries) => {
        setPassedKeys((previous) => {
          const next = new Set(previous);
          let changed = false;

          for (const entry of observerEntries) {
            const key = (entry.target as HTMLElement).getAttribute(
              "data-timeline-entry-key",
            );
            if (!key) {
              continue;
            }

            if (entry.isIntersecting) {
              if (!next.has(key)) {
                next.add(key);
                changed = true;
              }
            } else if (!monotonic && next.has(key)) {
              // Leaving upward (scrolling back) removes; leaving downward keeps.
              // Heuristic: if the card's bottom is above the band, it has scrolled past
              // downward — keep it. If its top is below the band, it hasn't reached yet —
              // remove (scroll-up unwind).
              const rect = entry.boundingClientRect;
              const bandMid = (window.innerHeight || 0) / 2;
              // Inclusive: top exactly at band mid means the card has left the
              // -50% rootMargin root downward (scroll-up), so unwind.
              if (rect.top >= bandMid) {
                next.delete(key);
                changed = true;
              }
            }
          }

          return changed ? next : previous;
        });
      },
      {
        // Card counts as passed once its top crosses roughly viewport middle.
        rootMargin: "0px 0px -50% 0px",
        threshold: [0, 0.01, 0.5, 1],
      },
    );

    for (const node of nodes) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [rootRef, entries, revealAll, monotonic]);

  if (revealAll) {
    return buildFullRoster(entries);
  }

  return buildCumulativeRoster(entries, passedKeys);
}
