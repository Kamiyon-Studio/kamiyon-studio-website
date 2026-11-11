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
  type?: "website" | "article";
};

/** Shared canonical, title, and sharing metadata for public pages. */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex,
  type = "website",
}: BuildPageMetadataOptions): Metadata {
  const cmsOgImageUrl = getCmsImageUrl(ogImage) ?? "/social-image";
  const suffix = ` | ${SITE_NAME}`;
  const pageTitle =
    title.endsWith(suffix) || title === SITE_NAME ? title : `${title}${suffix}`;

  return {
    title: { absolute: pageTitle },
    description,
    alternates: { canonical: path },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: pageTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      type,
      images: [{ url: cmsOgImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [cmsOgImageUrl],
    },
  };
}
