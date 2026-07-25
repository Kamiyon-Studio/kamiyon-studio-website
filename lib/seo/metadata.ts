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
 * With no CMS `seo.ogImage`, `images` is omitted: the generated
 * `opengraph-image.tsx` / `twitter-image.tsx` routes are served at a hashed
 * path (`/opengraph-image-<hash>`), so hardcoding the unhashed path here only
 * emits a 404 URL. Next injects the hashed URL for `/` itself; nested routes
 * currently ship no image until they carry a CMS `ogImage`.
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
      ...(cmsOgImageUrl ? { images: [{ url: cmsOgImageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(cmsOgImageUrl ? { images: [cmsOgImageUrl] } : {}),
    },
  };
}
