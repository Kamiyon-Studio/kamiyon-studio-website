import type { HomeHero } from "@/lib/cms/types";
import type { PartnerPlaceholder } from "@/lib/home/partner-placeholders";

import { HeroOpening } from "./HeroOpening";

type HeroProps = {
  hero: HomeHero;
  partners: PartnerPlaceholder[];
};

/**
 * Home first viewport — brand stage + motto with partners band.
 */
export function Hero({ hero, partners }: HeroProps) {
  return <HeroOpening hero={hero} partners={partners} />;
}
