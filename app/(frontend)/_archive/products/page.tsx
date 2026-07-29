import type { Metadata } from "next";

import { ProductGrid } from "@/components/sections/ProductGrid";
import { productsFallback, resolveWithFallback } from "@/lib/cms/fallbacks";
import { getProducts } from "@/lib/cms/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Products",
  description:
    "Explore Kamiyon Studio's original intellectual property — games and interactive experiences designed to educate, inspire, and make a lasting impact.",
  path: "/products",
});

export default async function ProductsPage() {
  const products = resolveWithFallback(await getProducts(), productsFallback);

  return <ProductGrid products={products} />;
}
