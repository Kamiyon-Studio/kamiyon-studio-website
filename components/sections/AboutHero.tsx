import { PageOpeningHero } from "@/components/sections/PageOpeningHero";
import type { AboutPage } from "@/lib/cms/types";

type AboutHeroProps = { aboutPage: AboutPage };

export function AboutHero({ aboutPage }: AboutHeroProps) {
  return (
    <PageOpeningHero
      id="about-hero"
      title="ABOUT US"
      ariaLabel="About us"
      description={aboutPage.mission}
    />
  );
}
