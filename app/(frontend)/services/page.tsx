import type { Metadata } from "next";

import { ServicesHero } from "@/components/sections/ServicesHero";
import { ServicesListing } from "@/components/sections/ServicesListing";
import { resolveWithFallback, servicesFallback } from "@/lib/cms/fallbacks";
import { getServices } from "@/lib/cms/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Services",
  description:
    "Kamiyon Studio is a creative technology studio — game development first, plus product development, UI & design, branding, and community & events.",
  path: "/services",
});

export default async function ServicesPage() {
  const services = resolveWithFallback(await getServices(), servicesFallback);

  return (
    <>
      <ServicesHero />
      <ServicesListing services={services} />
    </>
  );
}
