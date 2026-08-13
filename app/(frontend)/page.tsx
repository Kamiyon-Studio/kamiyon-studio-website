import type { Metadata } from "next";

import { Hero } from "@/components/sections/Hero";
import { HomeContact } from "@/components/sections/HomeContact";
import { HomeScrollMarker } from "@/components/sections/HomeScrollMarker";
import { ProjectsBento } from "@/components/sections/ProjectsBento";
import { RecognitionAwards } from "@/components/sections/RecognitionAwards";
import {
  ServicesStack,
  type ServiceStackSlide,
} from "@/components/sections/ServicesStack";
import {
  awardsFallback,
  homePageFallback,
  portfolioItemsFallback,
  resolveWithFallback,
  servicesFallback,
} from "@/lib/cms/fallbacks";
import { mapPartnerToMarqueeItem } from "@/lib/cms/mappers";
import {
  getAwards,
  getHomePage,
  getPartners,
  getPortfolioItems,
  getServices,
} from "@/lib/cms/queries";
import { PARTNER_PLACEHOLDERS } from "@/lib/home/partner-placeholders";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { HomeHero, HomePage, Service } from "@/lib/cms/types";

/** Static-path stub — parallax Hero ignores these fields. */
const HERO_STUB: HomeHero = {
  _type: "hero",
  headline: "",
  subheadline: "",
  ctaLabel: "",
  ctaHref: "",
};

async function getHomePageContent() {
  const homeCms = await getHomePage();

  if (homeCms === null) {
    // CMS unreachable → keep existing resolveWithFallback placeholders
    const [portfolioItems, services, partners, awards] = await Promise.all([
      getPortfolioItems(),
      getServices(),
      getPartners(),
      getAwards(),
    ]);

    return {
      home: homePageFallback as HomePage,
      portfolioItems: resolveWithFallback(portfolioItems, portfolioItemsFallback),
      services: resolveWithFallback(services, servicesFallback),
      awards: resolveWithFallback(awards, awardsFallback),
      partners: resolveWithFallback(
        partners?.map(mapPartnerToMarqueeItem) ?? null,
        PARTNER_PLACEHOLDERS,
      ),
    };
  }

  // CMS loaded singleton — named fields ONLY. Empty arrays stay empty.
  return {
    home: homeCms,
    portfolioItems: homeCms.portfolioItems,
    services: homeCms.services,
    awards: homeCms.awards,
    partners: homeCms.partners.map(mapPartnerToMarqueeItem),
  };
}

function toServiceStackSlides(services: Service[]): ServiceStackSlide[] {
  return [...services]
    .sort((a, b) => a.order - b.order)
    .map((service) => ({
      id: service.slug.current,
      eyebrow: "Services",
      title: service.title,
      summary: service.tagline || service.summary,
      exploreHref: `/services/${service.slug.current}`,
    }));
}

export async function generateMetadata(): Promise<Metadata> {
  const { home } = await getHomePageContent();

  return buildPageMetadata({
    title: home.seo.title,
    description: home.seo.description,
    path: "/",
    ogImage: home.seo.ogImage,
    noIndex: home.seo.noIndex,
  });
}

export default async function Home() {
  const { home, portfolioItems, services, partners, awards } =
    await getHomePageContent();

  const contact = home.contactCta ?? homePageFallback.contactCta;
  const serviceSlides = toServiceStackSlides(services);

  return (
    <>
      <HomeScrollMarker />
      <Hero hero={HERO_STUB} partners={partners} />
      {portfolioItems.length > 0 ? (
        <ProjectsBento caseStudies={portfolioItems} />
      ) : null}
      {awards.length > 0 ? <RecognitionAwards awards={awards} /> : null}
      {serviceSlides.length > 0 ? (
        <ServicesStack slides={serviceSlides} />
      ) : null}
      <HomeContact
        heading={contact.title}
        body={contact.body}
        ctaLabel={contact.ctaLabel}
        ctaHref={contact.ctaHref}
      />
    </>
  );
}
