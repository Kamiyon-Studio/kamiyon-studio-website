/** Shared primitives */

export type CtaVariant = "primary" | "secondary" | "ghost";

export type Slug = {
  current: string;
};

export type CmsImage = {
  _key?: string;
  /** Public CDN URL when resolved from Sanity `r2Asset`. */
  url?: string;
  /** R2 object key used with `getMediaUrl` when `url` is absent. */
  key?: string;
  alt?: string | null;
  caption?: string | null;
};

export type PortableTextBlock = {
  _key?: string;
  _type: "block";
  style?: string;
  children: Array<{
    _type: "span";
    text: string;
    marks?: string[];
  }>;
  markDefs?: Array<Record<string, unknown>>;
};

/** Blog portable-text image block (`blogBody` inlineImage). */
export type PortableTextInlineImage = {
  _key?: string;
  _type: "inlineImage";
  asset?: CmsImage;
};

export type BlogBodyBlock = PortableTextBlock | PortableTextInlineImage;

/** Spec 02 — seoMetadata, cta, socialLink */

export type SeoMetadata = {
  title: string;
  description: string;
  ogImage?: CmsImage;
  noIndex?: boolean;
};

export type Cta = {
  label: string;
  href: string;
  variant?: CtaVariant;
};

export type SocialPlatform =
  | "facebook"
  | "linkedin"
  | "email"
  | "itch"
  | "youtube"
  | "x"
  | "instagram"
  | "tiktok"
  | "github";

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
  label: string;
  isPlaceholder?: boolean;
};

/** Spec 02 — siteSettings (singleton) */

export type SiteSettings = {
  _type: "siteSettings";
  siteName: string;
  tagline: string;
  publicEmail?: string;
  socialLinks: SocialLink[];
  defaultSeo: SeoMetadata;
  globalCtas: Cta[];
  footerText?: string;
};

/** Spec 03 — homePage blocks */

export type HomeHero = {
  _type: "hero";
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  image?: CmsImage;
};

export type HomeMission = {
  _type: "mission";
  title: string;
  body: string;
};

/** GROQ projects featuredProducts/featuredCaseStudies refs → slug arrays */
export type HomeFeaturedWork = {
  _type: "featuredWork";
  title: string;
  body: string;
  featuredProductSlugs: string[];
  featuredCaseStudySlugs: string[];
};

export type HomeHighlight = {
  _key?: string;
  title: string;
  description: string;
  icon?: string;
};

export type HomeHighlights = {
  _type: "highlights";
  title: string;
  items: HomeHighlight[];
};

export type HomeCtaBanner = {
  _type: "ctaBanner";
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HomeBlock =
  | HomeHero
  | HomeMission
  | HomeFeaturedWork
  | HomeHighlights
  | HomeCtaBanner;

export type HomePage = {
  _type: "homePage";
  title: string;
  blocks: HomeBlock[];
  seo: SeoMetadata;
};

/** Spec 03 — aboutPage embedded objects */

export type StorySection = {
  title: string;
  body: string;
};

export type CoreValue = {
  name: string;
  description: string;
};

export type AboutPage = {
  _type: "aboutPage";
  title: string;
  storySections: StorySection[];
  mission: string;
  vision: string;
  motto: string;
  values: CoreValue[];
  cultureSummary: string;
  teamIntro?: string;
  seo: SeoMetadata;
};

/** Spec 03 — contactPage embedded objects */

export type ContactChannel = {
  type: SocialPlatform;
  label: string;
  value: string;
  isPlaceholder?: boolean;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ContactPage = {
  _type: "contactPage";
  headline: string;
  intro: string;
  channels: ContactChannel[];
  ctaNote?: string;
  faq: FaqItem[];
  seo: SeoMetadata;
};

/** Spec 04 — teamMember */

export type TeamMember = {
  _type: "teamMember";
  name: string;
  role: string;
  bio: string;
  photo?: CmsImage;
  socialLinks: SocialLink[];
  order: number;
  isPlaceholder: boolean;
};

/** Spec 04 — serviceCategory (deprecated Gate 0; flat five services) */

/** @deprecated Gate 0 — categories removed from public IA / seed; kept for WS-A/D transition. */
export type ServiceCategory = {
  _type: "serviceCategory";
  title: string;
  slug: Slug;
  description: string;
  order: number;
};

/**
 * Flat service document (ADR-016 / Gate 0).
 * `tagline` + `capabilities` replace category grouping and `outcomes`.
 */
export type Service = {
  _type: "service";
  title: string;
  slug: Slug;
  tagline: string;
  summary: string;
  body: PortableTextBlock[];
  capabilities: string[];
  icon?: string;
  order: number;
  isPlaceholder: boolean;
  seo: SeoMetadata;
};

/** Spec 05 — productMedia, product */

export type ProductStatus = "original-ip";

export type ProductDevelopmentStatus =
  | "in-development"
  | "prototype"
  | "released"
  | "tbd";

export type ProductMedia = {
  _key?: string;
  type: "image" | "video";
  asset?: CmsImage;
  alt?: string | null;
  caption?: string | null;
};

export type Product = {
  _type: "product";
  title: string;
  slug: Slug;
  tagline: string;
  genre: string;
  status: ProductStatus;
  developmentStatus: ProductDevelopmentStatus;
  overview: string;
  goals: string[];
  features: string[];
  platforms: string[];
  media: ProductMedia[];
  trailerUrl?: string;
  isPlaceholder: boolean;
  order: number;
  seo: SeoMetadata;
};

/** Spec 05 — portfolio (replaces caseStudy) */

export type Portfolio = {
  _type: "portfolio";
  title: string;
  slug: Slug;
  clientName: string;
  industry: string;
  /** Service category value from SERVICE_CATEGORIES. */
  serviceType: string;
  challenge: string;
  solution: string;
  impact: string;
  lessonsLearned?: string;
  coverImage?: CmsImage;
  gallery: CmsImage[];
  featured: boolean;
  isPlaceholder: boolean;
  publishedAt?: string;
  seo: SeoMetadata;
};

/** @deprecated Use Portfolio — kept for transitional UI prop aliases. */
export type CaseStudy = Portfolio;

/** Spec 05 — partner (home marquee) */

export type Partner = {
  _type: "partner";
  /** Marquee key: slug.current, else document `_id`. */
  id: string;
  label: string;
  slug: Slug;
  order: number;
  /** Logo/icon only — home marquee displays without links. */
  logo?: CmsImage;
  isPlaceholder: boolean;
};

/** Spec 05 — communityItem */

export type CommunityItemType =
  | "workshop"
  | "hackathon"
  | "game-jam"
  | "speaking"
  | "education"
  | "partnership"
  | "other";

export type CommunityItem = {
  _type: "communityItem";
  title: string;
  slug: Slug;
  type: CommunityItemType;
  summary: string;
  body: PortableTextBlock[];
  date?: string;
  location?: string;
  coverImage?: CmsImage;
  externalUrl?: string;
  isPlaceholder: boolean;
  seo: SeoMetadata;
};

/** Spec 07 — blog */

/** @deprecated Archived — posts now reference teamMember authors. */
export type Author = {
  _type: "author";
  name: string;
  slug: Slug;
  bio?: string;
  avatar?: CmsImage;
};

/** Blog taxonomy title/slug shape (titles looked up from POST_CATEGORIES). */
export type BlogCategory = {
  title: string;
  slug: Slug;
};

/** Blog tag title/slug shape (titles looked up from POST_TAGS). */
export type BlogTag = {
  title: string;
  slug: Slug;
};

export type Post = {
  _type: "post";
  title: string;
  slug: Slug;
  authors: TeamMember[];
  categories: BlogCategory[];
  tags: BlogTag[];
  featuredImage?: CmsImage;
  body: BlogBodyBlock[];
  seo: SeoMetadata;
  readingTimeMinutes?: number;
  publishedAt: string;
  updatedAt?: string;
  relatedPostSlugs: string[];
};
