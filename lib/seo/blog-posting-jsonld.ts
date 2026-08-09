import { getCmsImageUrl } from "@/lib/cms/image";
import type { Post } from "@/lib/cms/types";

import { SITE_NAME } from "./constants";
import { PRODUCTION_CANONICAL_ORIGIN } from "./site-url";

/**
 * BlogPosting JSON-LD from a published Post. Callers must only render when the
 * post is visible on the page — no fabricated authors, dates, or images.
 */
export function getBlogPostingJsonLd(post: Post) {
  const path = `/blog/${post.slug.current}`;
  const url = `${PRODUCTION_CANONICAL_ORIGIN}${path}`;
  const imageUrl =
    getCmsImageUrl(post.seo.ogImage) ?? getCmsImageUrl(post.featuredImage);
  const authors = post.authors
    .map((author) => author.name?.trim())
    .filter((name): name is string => Boolean(name));

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo.description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(authors.length > 0
      ? {
          author: authors.map((name) => ({
            "@type": "Person",
            name,
          })),
        }
      : {}),
    publisher: {
      "@type": "Organization",
      "@id": `${PRODUCTION_CANONICAL_ORIGIN}/#organization`,
      name: SITE_NAME,
    },
    isPartOf: {
      "@id": `${PRODUCTION_CANONICAL_ORIGIN}/#website`,
    },
  };
}
