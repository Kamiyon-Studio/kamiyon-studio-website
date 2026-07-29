import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/sections/ProductDetail";
import { productsFallback } from "@/lib/cms/fallbacks";
import { getProductBySlug, getProducts } from "@/lib/cms/queries";
import { getBreadcrumbJsonLd } from "@/lib/seo/breadcrumb-jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

async function getProductContent(slug: string) {
  const cmsProduct = await getProductBySlug(slug);

  if (cmsProduct) {
    return cmsProduct;
  }

  return productsFallback.find((product) => product.slug.current === slug) ?? null;
}

export async function generateStaticParams() {
  const products = (await getProducts()) ?? productsFallback;

  return products.map((product) => ({ slug: product.slug.current }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductContent(slug);

  if (!product) {
    return {};
  }

  return buildPageMetadata({
    title: product.seo.title,
    description: product.seo.description,
    path: `/products/${product.slug.current}`,
    ogImage: product.seo.ogImage ?? product.media[0]?.asset,
    noIndex: product.seo.noIndex,
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductContent(slug);

  if (!product) {
    notFound();
  }

  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: product.title, href: `/products/${product.slug.current}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  );
}
