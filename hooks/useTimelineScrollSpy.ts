"use client";

import { useEffect, useState } from "react";

export type UseTimelineScrollSpyOptions = {
  /** Scope root; observation is limited to descendants. */
  rootRef: React.RefObject<HTMLElement | null>;
  /** Re-run observation when the entry set changes. */
  entryKeys: readonly string[];
  /** Skip observation entirely (reduced motion / SSR). */
  disabled?: boolean;
};

const DEFAULT_THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

/**
 * Entry key with the greatest intersection ratio, or null before first callback.
 * Scoped to `[data-timeline-entry-key]` inside `rootRef`.
 */
export function useTimelineScrollSpy(
  options: UseTimelineScrollSpyOptions,
): string | null {
  const { rootRef, entryKeys, disabled = false } = options;
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const root = rootRef.current;
    if (!root || entryKeys.length === 0) {
      return;
    }

    const nodes = entryKeys
      .map((key) => {
        const safeKey = key.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        return root.querySelector<HTMLElement>(
          `[data-timeline-entry-key="${safeKey}"]`,
        );
      })
      .filter((element): element is HTMLElement => element != null);

    if (nodes.length === 0) {
      return;
    }

    const ratios = new Map<string, number>();

    const pickWinner = () => {
      let bestKey: string | null = null;
      let bestRatio = -1;

      for (const node of nodes) {
        const key = node.getAttribute("data-timeline-entry-key");
        if (!key) {
          continue;
        }
        const ratio = ratios.get(key) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestKey = key;
        }
      }

      if (bestKey) {
        setActiveKey(bestKey);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).getAttribute(
            "data-timeline-entry-key",
          );
          if (key) {
            ratios.set(key, entry.intersectionRatio);
          }
        }
        pickWinner();
      },
      {
        threshold: DEFAULT_THRESHOLDS,
      },
    );

    for (const node of nodes) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [rootRef, entryKeys, disabled]);

  return activeKey;
}
