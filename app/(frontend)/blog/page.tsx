import type { Metadata } from "next";

import { BlogListing } from "@/components/sections/BlogListing";
import { postsFallback, resolveWithFallback } from "@/lib/cms/fallbacks";
import { getPosts } from "@/lib/cms/queries";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog",
  description:
    "Studio updates, announcements, and notes from Kamiyon Studio.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = resolveWithFallback(await getPosts(), postsFallback);

  return <BlogListing posts={posts} />;
}
