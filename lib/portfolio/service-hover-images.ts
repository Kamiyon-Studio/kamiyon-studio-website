import { getCmsImageUrl } from "@/lib/cms/image";
import type { CmsImage, Portfolio } from "@/lib/cms/types";

export type ServiceHoverImage = {
  src: string;
  alt: string;
};

type PortfolioPhotoSource = Pick<
  Portfolio,
  "serviceType" | "isPlaceholder" | "title" | "coverImage" | "gallery"
>;

function toHoverImage(
  image: CmsImage,
  fallbackAlt: string,
): ServiceHoverImage | null {
  const src = getCmsImageUrl(image);
  if (!src) {
    return null;
  }

  const alt = image.alt?.trim() || fallbackAlt;
  return { src, alt };
}

/**
 * Picks two photos from published portfolio projects tagged with `serviceType`.
 * Cover is preferred, then gallery. A single photo is duplicated for the reveal pair.
 */
export function pickServiceHoverImages(
  items: readonly PortfolioPhotoSource[],
  serviceType: string,
): [ServiceHoverImage, ServiceHoverImage] | undefined {
  const photos: ServiceHoverImage[] = [];

  for (const item of items) {
    if (item.isPlaceholder || item.serviceType !== serviceType) {
      continue;
    }

    const cover = item.coverImage
      ? toHoverImage(item.coverImage, item.title)
      : null;
    if (cover) {
      photos.push(cover);
    }

    for (const galleryImage of item.gallery) {
      const photo = toHoverImage(galleryImage, item.title);
      if (photo) {
        photos.push(photo);
      }
    }
  }

  if (photos.length === 0) {
    return undefined;
  }

  return [photos[0], photos[1] ?? photos[0]];
}
