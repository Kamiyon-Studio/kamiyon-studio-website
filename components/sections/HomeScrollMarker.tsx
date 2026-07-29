"use client";

import { useCallback } from "react";

import { ScrollMarker } from "@/components/ui/ScrollMarker";
import { useSectionSpy } from "@/hooks/useSectionSpy";
import { HOME_SECTION_NAV } from "@/lib/home/section-nav";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

const SECTION_IDS = HOME_SECTION_NAV.map((item) => item.id);
const SECTION_ITEMS = HOME_SECTION_NAV.map((item) => ({ label: item.label }));

export function HomeScrollMarker() {
  const activeIndex = useSectionSpy(SECTION_IDS);

  const scrollToSection = useCallback((index: number) => {
    const targetId = HOME_SECTION_NAV[index]?.id;
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  return (
    <aside
      aria-label="Page sections"
      className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <div className="pointer-events-auto">
        <ScrollMarker
          items={SECTION_ITEMS}
          activeIndex={activeIndex}
          onItemClick={(index) => scrollToSection(index)}
        />
      </div>
    </aside>
  );
}
