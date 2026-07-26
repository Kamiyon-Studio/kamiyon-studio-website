import type { Metadata } from "next";

import { getCmsImageUrl } from "@/lib/cms/image";
import type { CmsImage } from "@/lib/cms/types";
import { SITE_NAME } from "./constants";

type BuildPageMetadataOptions = {
  title: string;
  description: string;
  /** Route path, e.g. "/services/game-development" — resolved against metadataBase. */
  path: string;
  ogImage?: CmsImage | null;
  noIndex?: boolean;
};

/**
 * Shared per-route metadata builder — every `generateMetadata`/`metadata`
 * export in `app/**` should go through this so canonical URLs and
 * OpenGraph/Twitter fields stay consistent across the site (Phase 9).
 *
 * Falls back to the site-wide generated image (`app/opengraph-image.tsx` /
 * `app/twitter-image.tsx`) when a route has no CMS `seo.ogImage`.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex,
}: BuildPageMetadataOptions): Metadata {
  const cmsOgImageUrl = getCmsImageUrl(ogImage);

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: cmsOgImageUrl ?? "/opengraph-image" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cmsOgImageUrl ?? "/twitter-image"],
    },
  };
}
