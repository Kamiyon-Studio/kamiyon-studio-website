import type { CmsImage, PortableTextBlock, SeoMetadata } from "@/lib/cms/types";

import type {
  SanityPortableBlock,
  SanityPortableSpan,
  SanityReference,
  SanitySeo,
  SanitySlug,
} from "./types";

/** Deterministic array `_key` for idempotent createOrReplace docs. */
export function arrayKey(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}

export function toSlug(current: string): SanitySlug {
  return { _type: "slug", current };
}

/** Map a fallback `CmsImage` into a Sanity `r2Asset` object for seed upserts. */
export function toR2Asset(image: CmsImage, key?: string): Record<string, unknown> {
  const asset: Record<string, unknown> = {
    _type: "r2Asset",
  };

  if (key) {
    asset._key = key;
  }
  if (image.key) {
    asset.key = image.key;
  }
  if (image.url) {
    asset.url = image.url;
  }
  if (image.alt != null && image.alt !== "") {
    asset.alt = image.alt;
  }
  if (image.caption != null && image.caption !== "") {
    asset.caption = image.caption;
  }

  return asset;
}

export function toReference(ref: string, key?: string): SanityReference {
  return key
    ? { _type: "reference", _ref: ref, _key: key }
    : { _type: "reference", _ref: ref };
}

/** Map CMS SEO; omit media (`ogImage`). */
export function toSeo(seo: SeoMetadata): SanitySeo {
  const result: SanitySeo = {
    title: seo.title,
    description: seo.description,
  };
  if (typeof seo.noIndex === "boolean") {
    return { ...result, noIndex: seo.noIndex };
  }
  return result;
}

/** Assign stable `_key`s to portable-text blocks/spans from fallbacks. */
export function toPortableBody(
  blocks: PortableTextBlock[],
  prefix = "block"
): SanityPortableBlock[] {
  return blocks.map((block, blockIndex) => {
    const children: SanityPortableSpan[] = block.children.map((child, childIndex) => {
      const span: SanityPortableSpan = {
        _type: "span",
        _key: arrayKey(`${prefix}-span-${blockIndex}`, childIndex),
        text: child.text,
      };
      if (child.marks && child.marks.length > 0) {
        return { ...span, marks: [...child.marks] };
      }
      return span;
    });

    return {
      _type: "block",
      _key: arrayKey(prefix, blockIndex),
      style: block.style ?? "normal",
      children,
      markDefs: block.markDefs ? [...block.markDefs] : [],
    };
  });
}
