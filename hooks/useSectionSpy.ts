"use client";

import { useEffect, useState } from "react";

export type UseSectionSpyOptions = {
  rootMargin?: string;
  threshold?: number | number[];
};

const DEFAULT_THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

/**
 * Tracks which of the given section ids currently has the highest
 * IntersectionObserver ratio. Returns index `0` when no matching nodes exist
 * (SSR-safe after mount).
 */
export function useSectionSpy(
  ids: readonly string[],
  options: UseSectionSpyOptions = {},
): number {
  const { rootMargin, threshold = DEFAULT_THRESHOLDS } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element != null);

    if (sections.length === 0) {
      return;
    }

    const ratios = new Map<string, number>();

    const pickWinner = () => {
      let bestId = sections[0].id;
      let bestRatio = -1;

      for (const section of sections) {
        const ratio = ratios.get(section.id) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = section.id;
        }
      }

      const nextIndex = ids.findIndex((id) => id === bestId);
      if (nextIndex >= 0) {
        setActiveIndex(nextIndex);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }
        pickWinner();
      },
      {
        rootMargin,
        threshold,
      },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [ids, rootMargin, threshold]);

  return activeIndex;
}
