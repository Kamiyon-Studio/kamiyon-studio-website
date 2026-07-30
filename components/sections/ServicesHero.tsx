"use client";

import { PageOpeningHero } from "@/components/sections/PageOpeningHero";

/**
 * Compact Services opening — same visual language as About, shortened so
 * the first service banners peek into the initial viewport.
 */
export function ServicesHero() {
  return (
    <PageOpeningHero
      id="services-hero"
      title="SERVICES"
      ariaLabel="Services"
      size="compact"
    />
  );
}
