import type { Metadata } from "next";

import { AnimatedSection } from "@/components/animation/AnimatedSection";
import { Hero } from "@/components/sections/Hero";
import { HomeContact } from "@/components/sections/HomeContact";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";
import { ProjectsBento } from "@/components/sections/ProjectsBento";
import {
  ServicesStack,
  type ServiceStackSlide,
} from "@/components/sections/ServicesStack";
import {
  homePageFallback,
  portfolioItemsFallback,
  resolveWithFallback,
  servicesFallback,
} from "@/lib/cms/fallbacks";
import { mapPartnerToMarqueeItem } from "@/lib/cms/mappers";
import {
  getHomePage,
  getPartners,
  getPortfolioItems,
  getServices,
} from "@/lib/cms/queries";
import { PARTNER_PLACEHOLDERS } from "@/lib/home/partner-placeholders";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { HomeCtaBanner, HomeHero, Service } from "@/lib/cms/types";

async function getHomePageContent() {
  const [home, portfolioItems, services, partners] = await Promise.all([
    getHomePage(),
    getPortfolioItems(),
    getServices(),
    getPartners(),
  ]);

  return {
    home: resolveWithFallback(home, homePageFallback),
    portfolioItems: resolveWithFallback(portfolioItems, portfolioItemsFallback),
    services: resolveWithFallback(services, servicesFallback),
    partners: resolveWithFallback(
      partners?.map(mapPartnerToMarqueeItem) ?? null,
      PARTNER_PLACEHOLDERS
    ),
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
  const { home, portfolioItems, services, partners } = await getHomePageContent();

  const hero = home.blocks.find((block) => block._type === "hero") as
    | HomeHero
    | undefined;
  const ctaBanner = home.blocks.find((block) => block._type === "ctaBanner") as
    | HomeCtaBanner
    | undefined;

  const contactDefaults = homePageFallback.blocks.find(
    (block) => block._type === "ctaBanner"
  ) as HomeCtaBanner;

  const contact = ctaBanner ?? contactDefaults;

  return (
    <>
      {hero ? <Hero hero={hero} /> : null}
      <AnimatedSection as="div" distance={28}>
        <PartnersMarquee eyebrow="Partners" partners={partners} />
      </AnimatedSection>
      <ProjectsBento caseStudies={portfolioItems} />
      <ServicesStack slides={toServiceStackSlides(services)} />
      <HomeContact
        heading={contact.title}
        body={contact.body}
        ctaLabel={contact.ctaLabel}
        ctaHref={contact.ctaHref}
      />
    </>
  );
}
