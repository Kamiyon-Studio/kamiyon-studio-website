import { defineQuery } from "next-sanity";

import { SERVICE_CATEGORIES } from "./taxonomies";

const r2AssetProjection = /* groq */ `{
  url,
  key,
  alt,
  caption,
  _key
}`;

const seoProjection = /* groq */ `{
  title,
  description,
  noIndex,
  ogImage ${r2AssetProjection}
}`;

const teamMemberProjection = /* groq */ `{
  _type,
  name,
  role,
  bio,
  photo ${r2AssetProjection},
  socialLinks[]{ platform, url, label, isPlaceholder },
  order,
  isPlaceholder
}`;

export const siteSettingsQuery = defineQuery(/* groq */ `
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    _type,
    siteName,
    tagline,
    publicEmail,
    socialLinks[]{ platform, url, label, isPlaceholder },
    defaultSeo ${seoProjection},
    globalCtas[]{ label, href, variant },
    footerText
  }
`);

export const homePageQuery = defineQuery(/* groq */ `
  *[_type == "homePage" && _id == "homePage"][0]{
    _type,
    title,
    blocks[]{
      _type == "hero" => {
        _type,
        headline,
        subheadline,
        ctaLabel,
        ctaHref,
        image ${r2AssetProjection}
      },
      _type == "mission" => {
        _type,
        title,
        body
      },
      _type == "featuredWork" => {
        _type,
        title,
        body,
        "featuredProductSlugs": featuredProducts[]->slug.current,
        "featuredCaseStudySlugs": featuredCaseStudies[]->slug.current
      },
      _type == "highlights" => {
        _type,
        title,
        items[]{ _key, title, description, icon }
      },
      _type == "ctaBanner" => {
        _type,
        title,
        body,
        ctaLabel,
        ctaHref
      }
    },
    seo ${seoProjection}
  }
`);

export const aboutPageQuery = defineQuery(/* groq */ `
  *[_type == "aboutPage" && _id == "aboutPage"][0]{
    _type,
    title,
    storySections[]{ title, body },
    timelineHeading,
    timelineSummary,
    timelineEntries[]{
      _key,
      entryType,
      year,
      dateLabel,
      date,
      title,
      body,
      images[] ${r2AssetProjection},
      image ${r2AssetProjection},
      teamMember->{ _id, name, role, photo ${r2AssetProjection} }
    },
    mission,
    vision,
    motto,
    values[]{ name, description },
    cultureSummary,
    teamIntro,
    seo ${seoProjection}
  }
`);

export const contactPageQuery = defineQuery(/* groq */ `
  *[_type == "contactPage" && _id == "contactPage"][0]{
    _type,
    headline,
    intro,
    channels[]{ type, label, value, isPlaceholder },
    ctaNote,
    faq[]{ question, answer },
    seo ${seoProjection}
  }
`);

export const teamMembersQuery = defineQuery(/* groq */ `
  *[_type == "teamMember"] | order(order asc) {
    _type,
    _id,
    name,
    role,
    bio,
    photo ${r2AssetProjection},
    socialLinks[]{ platform, url, label, isPlaceholder },
    order,
    isPlaceholder
  }
`);

/** Gate 0 / ADR-016 — derived from SERVICE_CATEGORIES (single source of truth). */
const CANONICAL_SERVICE_SLUGS_GROQ = JSON.stringify(
  SERVICE_CATEGORIES.map((c) => c.value),
);

export const servicesQuery = defineQuery(/* groq */ `
  *[_type == "service" && slug.current in ${CANONICAL_SERVICE_SLUGS_GROQ}] | order(order asc) {
    _type,
    title,
    slug,
    tagline,
    summary,
    body,
    capabilities,
    icon,
    order,
    isPlaceholder,
    seo ${seoProjection}
  }
`);

export const serviceBySlugQuery = defineQuery(/* groq */ `
  *[_type == "service" && slug.current == $slug && slug.current in ${CANONICAL_SERVICE_SLUGS_GROQ}][0]{
    _type,
    title,
    slug,
    tagline,
    summary,
    body,
    capabilities,
    icon,
    order,
    isPlaceholder,
    seo ${seoProjection}
  }
`);

export const productsQuery = defineQuery(/* groq */ `
  *[_type == "product"] | order(order asc) {
    _type,
    title,
    slug,
    tagline,
    genre,
    status,
    developmentStatus,
    overview,
    goals,
    features,
    platforms,
    media[]{
      _key,
      type,
      asset ${r2AssetProjection},
      alt,
      caption
    },
    trailerUrl,
    isPlaceholder,
    order,
    seo ${seoProjection}
  }
`);

export const productBySlugQuery = defineQuery(/* groq */ `
  *[_type == "product" && slug.current == $slug][0]{
    _type,
    title,
    slug,
    tagline,
    genre,
    status,
    developmentStatus,
    overview,
    goals,
    features,
    platforms,
    media[]{
      _key,
      type,
      asset ${r2AssetProjection},
      alt,
      caption
    },
    trailerUrl,
    isPlaceholder,
    order,
    seo ${seoProjection}
  }
`);

export const portfolioItemsQuery = defineQuery(/* groq */ `
  *[_type == "portfolio"] | order(coalesce(publishedAt, _createdAt) desc) {
    _type,
    title,
    slug,
    clientName,
    industry,
    serviceType,
    challenge,
    solution,
    impact,
    lessonsLearned,
    coverImage ${r2AssetProjection},
    gallery[] ${r2AssetProjection},
    featured,
    isPlaceholder,
    publishedAt,
    seo ${seoProjection}
  }
`);

export const portfolioItemBySlugQuery = defineQuery(/* groq */ `
  *[_type == "portfolio" && slug.current == $slug][0]{
    _type,
    title,
    slug,
    clientName,
    industry,
    serviceType,
    challenge,
    solution,
    impact,
    lessonsLearned,
    coverImage ${r2AssetProjection},
    gallery[] ${r2AssetProjection},
    featured,
    isPlaceholder,
    publishedAt,
    seo ${seoProjection}
  }
`);

export const communityItemsQuery = defineQuery(/* groq */ `
  *[_type == "communityItem"] | order(coalesce(date, _createdAt) desc) {
    _type,
    title,
    slug,
    type,
    summary,
    body,
    date,
    location,
    coverImage ${r2AssetProjection},
    externalUrl,
    isPlaceholder,
    seo ${seoProjection}
  }
`);

export const partnersQuery = defineQuery(/* groq */ `
  *[_type == "partner"] | order(order asc) {
    _id,
    _type,
    label,
    slug,
    order,
    logo ${r2AssetProjection},
    isPlaceholder
  }
`);

export const awardsQuery = defineQuery(/* groq */ `
  *[_type == "award"] | order(order asc) {
    _id,
    _type,
    title,
    label,
    organization,
    year,
    order,
    isPlaceholder
  }
`);

export const postsQuery = defineQuery(/* groq */ `
  *[_type == "post" && defined(publishedAt) && publishedAt <= now()] | order(publishedAt desc) {
    _type,
    title,
    slug,
    authors[]-> ${teamMemberProjection},
    categories,
    tags,
    featuredImage ${r2AssetProjection},
    body,
    seo ${seoProjection},
    readingTimeMinutes,
    publishedAt,
    updatedAt,
    "relatedPostSlugs": relatedPosts[]->slug.current
  }
`);

export const postBySlugQuery = defineQuery(/* groq */ `
  *[_type == "post" && slug.current == $slug && defined(publishedAt) && publishedAt <= now()][0]{
    _type,
    title,
    slug,
    authors[]-> ${teamMemberProjection},
    categories,
    tags,
    featuredImage ${r2AssetProjection},
    body,
    seo ${seoProjection},
    readingTimeMinutes,
    publishedAt,
    updatedAt,
    "relatedPostSlugs": relatedPosts[]->slug.current
  }
`);
