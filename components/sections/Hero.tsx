import type { HomeHero } from "@/lib/cms/types";
import { resolveHeroParallaxLayers } from "@/lib/home/hero-parallax-layers";
import type { PartnerPlaceholder } from "@/lib/home/partner-placeholders";

import { HeroOpening } from "./HeroOpening";
import { HeroParallaxOpening } from "./HeroParallaxOpening";

type HeroProps = {
  hero: HomeHero;
  partners: PartnerPlaceholder[];
};

/**
 * Home first viewport — brand stage + motto with partners band.
 *
 * Prefers the layered parallax stage served from R2. When the media CDN is not
 * configured (local dev without `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`, or a host
 * `next/image` would reject) it falls back to the static opening so the
 * homepage never ships a half-built scene.
 */
export function Hero({ hero, partners }: HeroProps) {
  const parallaxLayers = resolveHeroParallaxLayers();

  if (parallaxLayers) {
    return <HeroParallaxOpening layers={parallaxLayers} partners={partners} />;
  }

  return <HeroOpening hero={hero} partners={partners} />;
}
