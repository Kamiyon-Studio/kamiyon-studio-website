import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServiceDetail } from "@/components/sections/ServiceDetail";
import { servicesFallback } from "@/lib/cms/fallbacks";
import { getServiceBySlug, getServices } from "@/lib/cms/queries";
import { getBreadcrumbJsonLd } from "@/lib/seo/breadcrumb-jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

async function getServiceContent(slug: string) {
  const cmsService = await getServiceBySlug(slug);

  if (cmsService) {
    return cmsService;
  }

  return servicesFallback.find((service) => service.slug.current === slug) ?? null;
}

export async function generateStaticParams() {
  const services = (await getServices()) ?? servicesFallback;

  return services.map((service) => ({ slug: service.slug.current }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceContent(slug);

  if (!service) {
    return {};
  }

  return buildPageMetadata({
    title: service.seo.title,
    description: service.seo.description,
    path: `/services/${service.slug.current}`,
    ogImage: service.seo.ogImage,
    noIndex: service.seo.noIndex,
  });
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = await getServiceContent(slug);

  if (!service) {
    notFound();
  }

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: service.title, href: `/services/${service.slug.current}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ServiceDetail service={service} />
    </>
  );
}
