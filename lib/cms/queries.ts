import { safeSanityFetch } from "./fetch";
import {
  aboutPageQuery,
  awardsQuery,
  communityItemsQuery,
  contactPageQuery,
  homePageQuery,
  partnersQuery,
  portfolioItemBySlugQuery,
  portfolioItemsQuery,
  postBySlugQuery,
  postsQuery,
  productBySlugQuery,
  productsQuery,
  serviceBySlugQuery,
  servicesQuery,
  siteSettingsQuery,
  teamMembersQuery,
} from "./groq";
import {
  mapAboutPage,
  mapAward,
  mapCollection,
  mapCommunityItem,
  mapContactPage,
  mapHomePage,
  mapPartner,
  mapPortfolio,
  mapPost,
  mapProduct,
  mapService,
  mapSiteSettings,
  mapTeamMember,
  sortServicesCanonically,
} from "./mappers";
import { isServiceCategoryValue } from "./taxonomies";
import type {
  AboutPage,
  Award,
  CommunityItem,
  ContactPage,
  HomePage,
  Partner,
  Portfolio,
  Post,
  Product,
  Service,
  SiteSettings,
  TeamMember,
} from "./types";

/**
 * CMS query layer — Sanity + GROQ with typed fallbacks.
 * Returns null when Sanity is unset, empty, or errors so pages keep using resolveWithFallback().
 */

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return mapSiteSettings(await safeSanityFetch(siteSettingsQuery, {}, { tags: ["sanity", "siteSettings"] }));
}

export async function getHomePage(): Promise<HomePage | null> {
  return mapHomePage(await safeSanityFetch(homePageQuery, {}, { tags: ["sanity", "homePage"] }));
}

export async function getAboutPage(): Promise<AboutPage | null> {
  return mapAboutPage(await safeSanityFetch(aboutPageQuery, {}, { tags: ["sanity", "aboutPage"] }));
}

export async function getContactPage(): Promise<ContactPage | null> {
  return mapContactPage(
    await safeSanityFetch(contactPageQuery, {}, { tags: ["sanity", "contactPage"] }),
  );
}

export async function getTeamMembers(): Promise<TeamMember[] | null> {
  return mapCollection(
    await safeSanityFetch(teamMembersQuery, {}, { tags: ["sanity", "teamMember"] }),
    mapTeamMember,
  );
}

export async function getServices(): Promise<Service[] | null> {
  const mapped = mapCollection(
    await safeSanityFetch(servicesQuery, {}, { tags: ["sanity", "service"] }),
    mapService,
  );
  if (!mapped) {
    return null;
  }
  return sortServicesCanonically(mapped);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  if (!isServiceCategoryValue(slug)) {
    return null;
  }
  return mapService(
    await safeSanityFetch(serviceBySlugQuery, { slug }, { tags: ["sanity", "service", `service:${slug}`] }),
  );
}

export async function getProducts(): Promise<Product[] | null> {
  return mapCollection(
    await safeSanityFetch(productsQuery, {}, { tags: ["sanity", "product"] }),
    mapProduct,
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return mapProduct(
    await safeSanityFetch(productBySlugQuery, { slug }, { tags: ["sanity", "product", `product:${slug}`] }),
  );
}

export async function getPortfolioItems(): Promise<Portfolio[] | null> {
  return mapCollection(
    await safeSanityFetch(portfolioItemsQuery, {}, { tags: ["sanity", "portfolio"] }),
    mapPortfolio,
  );
}

export async function getPortfolioItemBySlug(slug: string): Promise<Portfolio | null> {
  return mapPortfolio(
    await safeSanityFetch(
      portfolioItemBySlugQuery,
      { slug },
      { tags: ["sanity", "portfolio", `portfolio:${slug}`] },
    ),
  );
}

export async function getCommunityItems(): Promise<CommunityItem[] | null> {
  return mapCollection(
    await safeSanityFetch(communityItemsQuery, {}, { tags: ["sanity", "communityItem"] }),
    mapCommunityItem,
  );
}

export async function getPartners(): Promise<Partner[] | null> {
  return mapCollection(
    await safeSanityFetch(partnersQuery, {}, { tags: ["sanity", "partner"] }),
    mapPartner,
  );
}

export async function getAwards(): Promise<Award[] | null> {
  return mapCollection(
    await safeSanityFetch(awardsQuery, {}, { tags: ["sanity", "award"] }),
    mapAward,
  );
}

export async function getPosts(): Promise<Post[] | null> {
  return mapCollection(
    await safeSanityFetch(postsQuery, {}, { tags: ["sanity", "post"] }),
    mapPost,
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return mapPost(
    await safeSanityFetch(postBySlugQuery, { slug }, { tags: ["sanity", "post", `post:${slug}`] }),
  );
}
