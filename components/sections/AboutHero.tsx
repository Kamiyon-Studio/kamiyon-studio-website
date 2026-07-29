"use client";

import { PageOpeningHero } from "@/components/sections/PageOpeningHero";
import type { AboutPage } from "@/lib/cms/types";

type AboutHeroProps = {
  aboutPage: AboutPage;
};

/**
 * Full-viewport About opening — ABOUT US only (homepage-like stage).
 * Mission, motto, and quick links live elsewhere on the page.
 */
export function AboutHero({ aboutPage }: AboutHeroProps) {
  void aboutPage;

  return (
    <PageOpeningHero id="about-hero" title="ABOUT US" ariaLabel="About us" />
  );
}
