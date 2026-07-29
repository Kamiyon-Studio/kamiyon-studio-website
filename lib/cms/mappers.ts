import { getCmsImageUrl } from "./image";
import { mapR2AssetToCmsImage, type R2AssetRef } from "./media";
import {
  findTaxonomyTitle,
  isServiceCategoryValue,
  POST_CATEGORIES,
  POST_TAGS,
  SERVICE_CATEGORIES,
} from "./taxonomies";
import type {
  AboutPage,
  BlogBodyBlock,
  StoryTimelineEntry,
  BlogCategory,
  BlogTag,
  CommunityItem,
  ContactPage,
  Cta,
  HomeBlock,
  HomePage,
  Partner,
  PortableTextBlock,
  Portfolio,
  Post,
  Product,
  ProductMedia,
  SeoMetadata,
  Service,
  SiteSettings,
  Slug,
  SocialLink,
  TeamMember,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown): boolean {
  return Boolean(value);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function mapSlug(value: unknown): Slug {
  const record = asRecord(value);
  if (record && typeof record.current === "string") {
    return { current: record.current };
  }
  if (typeof value === "string") {
    return { current: value };
  }
  return { current: "" };
}

function mapSeo(value: unknown): SeoMetadata {
  const source = asRecord(value) ?? {};
  return {
    title: asString(source.title),
    description: asString(source.description),
    ogImage: mapR2AssetToCmsImage(source.ogImage as R2AssetRef | null | undefined),
    noIndex: asBoolean(source.noIndex),
  };
}

function mapSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const row = asRecord(item) ?? {};
    return {
      platform: row.platform as SocialLink["platform"],
      url: asString(row.url),
      label: asString(row.label),
      isPlaceholder: asBoolean(row.isPlaceholder),
    };
  });
}

function mapCtas(value: unknown): Cta[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const row = asRecord(item) ?? {};
    return {
      label: asString(row.label),
      href: asString(row.href),
      variant: (row.variant as Cta["variant"] | undefined) ?? undefined,
    };
  });
}

function mapPortableBody(value: unknown): PortableTextBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((block) => asRecord(block)?._type === "block") as PortableTextBlock[];
}

function mapBlogBody(value: unknown): BlogBodyBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((block): BlogBodyBlock | null => {
      const row = asRecord(block);
      if (!row) {
        return null;
      }

      if (row._type === "block") {
        return block as PortableTextBlock;
      }

      if (row._type === "inlineImage") {
        return {
          _type: "inlineImage",
          _key: typeof row._key === "string" ? row._key : undefined,
          asset: mapR2AssetToCmsImage(row.asset as R2AssetRef | null | undefined),
        };
      }

      return null;
    })
    .filter((block): block is BlogBodyBlock => block !== null);
}

function mapHomeBlocks(value: unknown): HomeBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((block): HomeBlock | null => {
      const row = asRecord(block);
      if (!row) {
        return null;
      }

      switch (row._type) {
        case "hero":
          return {
            _type: "hero",
            headline: asString(row.headline),
            subheadline: asString(row.subheadline),
            ctaLabel: asString(row.ctaLabel),
            ctaHref: asString(row.ctaHref),
            image: mapR2AssetToCmsImage(row.image as R2AssetRef | null | undefined),
          };
        case "mission":
          return {
            _type: "mission",
            title: asString(row.title),
            body: asString(row.body),
          };
        case "featuredWork":
          return {
            _type: "featuredWork",
            title: asString(row.title),
            body: asString(row.body),
            featuredProductSlugs: asStringArray(row.featuredProductSlugs),
            featuredCaseStudySlugs: asStringArray(row.featuredCaseStudySlugs),
          };
        case "highlights":
          return {
            _type: "highlights",
            title: asString(row.title),
            items: (Array.isArray(row.items) ? row.items : []).map((item, index) => {
              const highlight = asRecord(item) ?? {};
              return {
                _key:
                  typeof highlight._key === "string" ? highlight._key : `highlight-${index}`,
                title: asString(highlight.title),
                description: asString(highlight.description),
                icon: typeof highlight.icon === "string" ? highlight.icon : undefined,
              };
            }),
          };
        case "ctaBanner":
          return {
            _type: "ctaBanner",
            title: asString(row.title),
            body: asString(row.body),
            ctaLabel: asString(row.ctaLabel),
            ctaHref: asString(row.ctaHref),
          };
        default:
          return null;
      }
    })
    .filter((block): block is HomeBlock => block !== null);
}

export function mapSiteSettings(doc: unknown): SiteSettings | null {
  const row = asRecord(doc);
  if (!row || typeof row.siteName !== "string" || !row.siteName.trim()) {
    return null;
  }

  return {
    _type: "siteSettings",
    siteName: row.siteName,
    tagline: asString(row.tagline),
    publicEmail: typeof row.publicEmail === "string" ? row.publicEmail : undefined,
    socialLinks: mapSocialLinks(row.socialLinks),
    defaultSeo: mapSeo(row.defaultSeo),
    globalCtas: mapCtas(row.globalCtas),
    footerText: typeof row.footerText === "string" ? row.footerText : undefined,
  };
}

export function mapHomePage(doc: unknown): HomePage | null {
  const row = asRecord(doc);
  if (!row || typeof row.title !== "string" || !Array.isArray(row.blocks) || row.blocks.length === 0) {
    return null;
  }

  return {
    _type: "homePage",
    title: row.title,
    blocks: mapHomeBlocks(row.blocks),
    seo: mapSeo(row.seo),
  };
}

function mapStoryTimelineEntry(
  value: unknown,
  index: number,
): StoryTimelineEntry | null {
  const item = asRecord(value);
  if (!item) {
    return null;
  }

  const year = asString(item.year).trim();
  const dateLabel = asString(item.dateLabel).trim();
  const title = asString(item.title).trim();
  const body = asString(item.body).trim();

  if (!year || !dateLabel || !title || !body) {
    return null;
  }

  const key =
    typeof item._key === "string" && item._key.trim()
      ? item._key
      : `timeline-${index}`;
  const date = typeof item.date === "string" && item.date.trim() ? item.date.trim() : undefined;

  return {
    key,
    year,
    dateLabel,
    ...(date ? { date } : {}),
    title,
    body,
    image: mapR2AssetToCmsImage(item.image as R2AssetRef | null | undefined),
  };
}

export function mapAboutPage(doc: unknown): AboutPage | null {
  const row = asRecord(doc);
  if (!row || typeof row.title !== "string" || typeof row.mission !== "string") {
    return null;
  }

  return {
    _type: "aboutPage",
    title: row.title,
    storySections: (Array.isArray(row.storySections) ? row.storySections : []).map((section) => {
      const item = asRecord(section) ?? {};
      return {
        title: asString(item.title),
        body: asString(item.body),
      };
    }),
    timelineHeading: asString(row.timelineHeading),
    timelineSummary: asString(row.timelineSummary),
    timelineEntries: (Array.isArray(row.timelineEntries) ? row.timelineEntries : [])
      .map((entry, index) => mapStoryTimelineEntry(entry, index))
      .filter((entry): entry is StoryTimelineEntry => entry !== null),
    mission: row.mission,
    vision: asString(row.vision),
    motto: asString(row.motto),
    values: (Array.isArray(row.values) ? row.values : []).map((value) => {
      const item = asRecord(value) ?? {};
      return {
        name: asString(item.name),
        description: asString(item.description),
      };
    }),
    cultureSummary: asString(row.cultureSummary),
    teamIntro: typeof row.teamIntro === "string" ? row.teamIntro : undefined,
    seo: mapSeo(row.seo),
  };
}

export function mapContactPage(doc: unknown): ContactPage | null {
  const row = asRecord(doc);
  if (!row || typeof row.headline !== "string") {
    return null;
  }

  return {
    _type: "contactPage",
    headline: row.headline,
    intro: asString(row.intro),
    channels: (Array.isArray(row.channels) ? row.channels : []).map((channel) => {
      const item = asRecord(channel) ?? {};
      return {
        type: item.type as ContactPage["channels"][number]["type"],
        label: asString(item.label),
        value: asString(item.value),
        isPlaceholder: asBoolean(item.isPlaceholder),
      };
    }),
    ctaNote: typeof row.ctaNote === "string" ? row.ctaNote : undefined,
    faq: (Array.isArray(row.faq) ? row.faq : []).map((faq) => {
      const item = asRecord(faq) ?? {};
      return {
        question: asString(item.question),
        answer: asString(item.answer),
      };
    }),
    seo: mapSeo(row.seo),
  };
}

export function mapTeamMember(doc: unknown): TeamMember | null {
  const row = asRecord(doc);
  if (!row || typeof row.name !== "string") {
    return null;
  }

  return {
    _type: "teamMember",
    _id: typeof row._id === "string" ? row._id : undefined,
    name: row.name,
    role: asString(row.role),
    bio: asString(row.bio),
    photo: mapR2AssetToCmsImage(row.photo as R2AssetRef | null | undefined),
    socialLinks: mapSocialLinks(row.socialLinks),
    order: asNumber(row.order),
    isPlaceholder: asBoolean(row.isPlaceholder),
  };
}

/**
 * Maps a flat Gate 0 service document.
 * Rejects non-canonical slugs; ignores legacy category/outcomes fields.
 */
export function mapService(doc: unknown): Service | null {
  const row = asRecord(doc);
  if (!row || typeof row.title !== "string") {
    return null;
  }

  const slug = mapSlug(row.slug);
  if (!isServiceCategoryValue(slug.current)) {
    return null;
  }

  return {
    _type: "service",
    title: row.title,
    slug,
    tagline: asString(row.tagline),
    summary: asString(row.summary),
    body: mapPortableBody(row.body),
    capabilities: asStringArray(row.capabilities),
    icon: typeof row.icon === "string" ? row.icon : undefined,
    order: asNumber(row.order),
    isPlaceholder: asBoolean(row.isPlaceholder),
    seo: mapSeo(row.seo),
  };
}

/** Sort mapped services into Gate 0 fixed order (game → … → community-events). */
export function sortServicesCanonically(services: Service[]): Service[] {
  const order = new Map<string, number>(
    SERVICE_CATEGORIES.map((entry, index) => [entry.value, index]),
  );
  return [...services].sort(
    (a, b) =>
      (order.get(a.slug.current) ?? Number.POSITIVE_INFINITY) -
      (order.get(b.slug.current) ?? Number.POSITIVE_INFINITY),
  );
}

function mapProductMedia(value: unknown): ProductMedia[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const row = asRecord(item) ?? {};
    return {
      _key: typeof row._key === "string" ? row._key : `media-${index}`,
      type: row.type === "video" ? "video" : "image",
      asset: mapR2AssetToCmsImage(row.asset as R2AssetRef | null | undefined, {
        alt: typeof row.alt === "string" ? row.alt : null,
        caption: typeof row.caption === "string" ? row.caption : null,
      }),
      alt: typeof row.alt === "string" ? row.alt : null,
      caption: typeof row.caption === "string" ? row.caption : null,
    };
  });
}

export function mapProduct(doc: unknown): Product | null {
  const row = asRecord(doc);
  if (!row || typeof row.title !== "string") {
    return null;
  }

  return {
    _type: "product",
    title: row.title,
    slug: mapSlug(row.slug),
    tagline: asString(row.tagline),
    genre: asString(row.genre),
    status: "original-ip",
    developmentStatus:
      (row.developmentStatus as Product["developmentStatus"] | undefined) ?? "tbd",
    overview: asString(row.overview),
    goals: asStringArray(row.goals),
    features: asStringArray(row.features),
    platforms: asStringArray(row.platforms),
    media: mapProductMedia(row.media),
    trailerUrl: typeof row.trailerUrl === "string" ? row.trailerUrl : undefined,
    isPlaceholder: asBoolean(row.isPlaceholder),
    order: asNumber(row.order),
    seo: mapSeo(row.seo),
  };
}

export function mapPortfolio(doc: unknown): Portfolio | null {
  const row = asRecord(doc);
  if (!row || typeof row.title !== "string") {
    return null;
  }

  return {
    _type: "portfolio",
    title: row.title,
    slug: mapSlug(row.slug),
    clientName: asString(row.clientName),
    industry: asString(row.industry),
    serviceType: asString(row.serviceType),
    challenge: asString(row.challenge),
    solution: asString(row.solution),
    impact: asString(row.impact),
    lessonsLearned: typeof row.lessonsLearned === "string" ? row.lessonsLearned : undefined,
    coverImage: mapR2AssetToCmsImage(row.coverImage as R2AssetRef | null | undefined),
    gallery: (Array.isArray(row.gallery) ? row.gallery : [])
      .map((item, index) =>
        mapR2AssetToCmsImage(item as R2AssetRef | null | undefined, {
          _key:
            typeof asRecord(item)?._key === "string"
              ? (asRecord(item)!._key as string)
              : `gallery-${index}`,
        }),
      )
      .filter((image): image is NonNullable<typeof image> => Boolean(image)),
    featured: asBoolean(row.featured),
    isPlaceholder: asBoolean(row.isPlaceholder),
    publishedAt: typeof row.publishedAt === "string" ? row.publishedAt : undefined,
    seo: mapSeo(row.seo),
  };
}

/** @deprecated Use mapPortfolio. */
export const mapCaseStudy = mapPortfolio;

export function mapCommunityItem(doc: unknown): CommunityItem | null {
  const row = asRecord(doc);
  if (!row || typeof row.title !== "string") {
    return null;
  }

  return {
    _type: "communityItem",
    title: row.title,
    slug: mapSlug(row.slug),
    type: (row.type as CommunityItem["type"] | undefined) ?? "other",
    summary: asString(row.summary),
    body: mapPortableBody(row.body),
    date: typeof row.date === "string" ? row.date : undefined,
    location: typeof row.location === "string" ? row.location : undefined,
    coverImage: mapR2AssetToCmsImage(row.coverImage as R2AssetRef | null | undefined),
    externalUrl: typeof row.externalUrl === "string" ? row.externalUrl : undefined,
    isPlaceholder: asBoolean(row.isPlaceholder),
    seo: mapSeo(row.seo),
  };
}

/** Maps a partner doc to CMS shape; `id` prefers slug.current, then `_id`. */
export function mapPartner(doc: unknown): Partner | null {
  const row = asRecord(doc);
  if (!row || typeof row.label !== "string" || !row.label.trim()) {
    return null;
  }

  const slug = mapSlug(row.slug);
  const documentId = typeof row._id === "string" ? row._id : "";
  const id = slug.current || documentId;
  if (!id) {
    return null;
  }

  return {
    _type: "partner",
    id,
    label: row.label,
    slug,
    order: asNumber(row.order),
    logo: mapR2AssetToCmsImage(row.logo as R2AssetRef | null | undefined),
    isPlaceholder: asBoolean(row.isPlaceholder),
  };
}

/** Marquee slot shape used by PartnersMarquee / PARTNER_PLACEHOLDERS. */
export function mapPartnerToMarqueeItem(partner: Partner): {
  id: string;
  label: string;
  logoUrl: string | null;
  logoAlt: string;
} {
  return {
    id: partner.id,
    label: partner.label,
    logoUrl: getCmsImageUrl(partner.logo),
    logoAlt:
      typeof partner.logo?.alt === "string" && partner.logo.alt.trim()
        ? partner.logo.alt
        : partner.label,
  };
}

function mapBlogTaxonomyFromValues(
  value: unknown,
  options: readonly { value: string; title: string }[],
): BlogCategory[] {
  return asStringArray(value).map((slug) => ({
    title: findTaxonomyTitle(options, slug) ?? slug,
    slug: { current: slug },
  }));
}

function mapBlogTagsFromValues(value: unknown): BlogTag[] {
  return asStringArray(value).map((slug) => ({
    title: findTaxonomyTitle(POST_TAGS, slug) ?? slug,
    slug: { current: slug },
  }));
}

export function mapPost(doc: unknown): Post | null {
  const row = asRecord(doc);
  if (!row || typeof row.title !== "string" || typeof row.publishedAt !== "string") {
    return null;
  }

  return {
    _type: "post",
    title: row.title,
    slug: mapSlug(row.slug),
    authors: (Array.isArray(row.authors) ? row.authors : [])
      .map(mapTeamMember)
      .filter((author): author is TeamMember => Boolean(author)),
    categories: mapBlogTaxonomyFromValues(row.categories, POST_CATEGORIES),
    tags: mapBlogTagsFromValues(row.tags),
    featuredImage: mapR2AssetToCmsImage(row.featuredImage as R2AssetRef | null | undefined),
    body: mapBlogBody(row.body),
    seo: mapSeo(row.seo),
    readingTimeMinutes:
      typeof row.readingTimeMinutes === "number" ? row.readingTimeMinutes : undefined,
    publishedAt: row.publishedAt,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : undefined,
    relatedPostSlugs: asStringArray(row.relatedPostSlugs),
  };
}

export function mapCollection<T>(
  rows: unknown,
  mapItem: (doc: unknown) => T | null,
): T[] | null {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const mapped = rows.map(mapItem).filter((item): item is T => item !== null);
  return mapped.length > 0 ? mapped : null;
}
