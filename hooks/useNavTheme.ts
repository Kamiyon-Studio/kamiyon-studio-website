"use client";

import { useEffect, useState } from "react";

export type NavTheme = "light" | "dark";

export type UseNavThemeOptions = {
  rootMargin?: string;
  forcedTheme?: NavTheme | null;
};

const DEFAULT_ROOT_MARGIN = "-72px 0px 0px 0px";
const OBSERVER_THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

function getThemeFromElement(element: Element): NavTheme | null {
  const value = element.getAttribute("data-nav-theme");
  if (value === "light" || value === "dark") {
    return value;
  }
  return null;
}

function getObservedThemeElements(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-nav-theme]")).filter(
    (element) => !element.closest(".sterling-gate"),
  );
}

/**
 * Reports the `data-nav-theme` of the band currently dominating the fixed
 * header strip, so the nav can adapt its ink to the content behind it.
 * Nodes inside `.sterling-gate` are skipped: the nav mirrors its own resolved
 * theme onto its root, and observing that would feed the result back in.
 */
export function useNavTheme(options: UseNavThemeOptions = {}): NavTheme {
  const { rootMargin = DEFAULT_ROOT_MARGIN, forcedTheme = null } = options;
  const [theme, setTheme] = useState<NavTheme>("light");

  useEffect(() => {
    if (forcedTheme !== null) {
      return;
    }

    const elements = getObservedThemeElements();
    if (elements.length === 0) {
      return;
    }

    const ratios = new Map<Element, number>();

    const pickWinner = () => {
      let bestTheme: NavTheme = "light";
      let bestRatio = -1;

      for (const element of elements) {
        const ratio = ratios.get(element) ?? 0;
        if (ratio <= bestRatio) {
          continue;
        }

        const elementTheme = getThemeFromElement(element);
        if (!elementTheme) {
          continue;
        }

        bestRatio = ratio;
        bestTheme = elementTheme;
      }

      setTheme(bestRatio > 0 ? bestTheme : "light");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.intersectionRatio);
        }
        pickWinner();
      },
      {
        rootMargin,
        threshold: OBSERVER_THRESHOLDS,
      },
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [forcedTheme, rootMargin]);

  if (forcedTheme !== null) {
    return forcedTheme;
  }

  return theme;
}
