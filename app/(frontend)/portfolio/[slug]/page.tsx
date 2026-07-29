import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudy } from "@/components/sections/CaseStudy";
import { portfolioItemsFallback } from "@/lib/cms/fallbacks";
import { getPortfolioItemBySlug, getPortfolioItems } from "@/lib/cms/queries";
import { getBreadcrumbJsonLd } from "@/lib/seo/breadcrumb-jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PortfolioItemPageProps = {
  params: Promise<{ slug: string }>;
};

async function getPortfolioContent(slug: string) {
  const cmsItem = await getPortfolioItemBySlug(slug);

  if (cmsItem) {
    return cmsItem;
  }

  return (
    portfolioItemsFallback.find((item) => item.slug.current === slug) ?? null
  );
}

export async function generateStaticParams() {
  const items = (await getPortfolioItems()) ?? portfolioItemsFallback;

  return items.map((item) => ({ slug: item.slug.current }));
}

export async function generateMetadata({
  params,
}: PortfolioItemPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioContent(slug);

  if (!item) {
    return {};
  }

  return buildPageMetadata({
    title: item.seo.title,
    description: item.seo.description,
    path: `/portfolio/${item.slug.current}`,
    ogImage: item.seo.ogImage ?? item.coverImage,
    noIndex: item.seo.noIndex,
  });
}

export default async function PortfolioItemPage({ params }: PortfolioItemPageProps) {
  const { slug } = await params;
  const item = await getPortfolioContent(slug);

  if (!item) {
    notFound();
  }

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Portfolio", href: "/portfolio" },
    { name: item.title, href: `/portfolio/${item.slug.current}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CaseStudy caseStudy={item} />
    </>
  );
}
