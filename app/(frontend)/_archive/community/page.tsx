import type { Metadata } from "next";

import { CommunityFeed } from "@/components/sections/CommunityFeed";
import { communityItemsFallback, resolveWithFallback } from "@/lib/cms/fallbacks";
import { getCommunityItems } from "@/lib/cms/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Community",
  description:
    "See how Kamiyon Studio gives back through workshops, hackathons, game jams, speaking engagements, educational initiatives, and partnerships.",
  path: "/community",
});

export default async function CommunityPage() {
  const items = resolveWithFallback(await getCommunityItems(), communityItemsFallback);

  return <CommunityFeed items={items} />;
}
