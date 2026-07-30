/**
 * Sanity seed builders.
 *
 * Active seed set excludes archived document types (re-seed, don't migrate).
 */

import type { SeedDocument } from "../types";

import { buildAboutPageDocument } from "./about";
import { buildAwardDocuments } from "./awards";
import { buildBlogSeedDocuments } from "./blog";
import { buildContactPageDocument } from "./contact";
import { buildHomePageDocument } from "./home";
import { buildPartnerDocuments } from "./partners";
import { buildPortfolioDocuments } from "./portfolio";
import { buildServiceDocuments } from "./services";
import { buildSiteSettingsDocument } from "./site-settings";
import { buildTeamMemberDocuments } from "./team";

export { buildAboutPageDocument } from "./about";
export { buildAwardDocument, buildAwardDocuments } from "./awards";
export {
  buildBlogAuthorDocument,
  buildBlogCategoryDocument,
  buildBlogPostDocument,
  buildBlogSeedDocuments,
  buildBlogTagDocuments,
  listBlogSeedDocumentIds,
} from "./blog";
export {
  buildCaseStudyDocument,
  buildCaseStudyDocuments,
  buildPortfolioDocument,
  buildPortfolioDocuments,
} from "./portfolio";
export {
  buildCommunityItemDocument,
  buildCommunityItemDocuments,
} from "./community";
export { buildContactPageDocument } from "./contact";
export { buildHomePageDocument } from "./home";
export { buildPartnerDocument, buildPartnerDocuments } from "./partners";
export { buildProductDocument, buildProductDocuments } from "./products";
export {
  buildServiceDocument,
  buildServiceDocuments,
} from "./services";
export { buildSiteSettingsDocument } from "./site-settings";
export { buildTeamMemberDocument, buildTeamMemberDocuments } from "./team";

/**
 * Core seed documents — no archived types, no partners/blog.
 * Order keeps home after featured portfolio refs.
 */
export function buildCoreSeedDocuments(): SeedDocument[] {
  return [
    buildSiteSettingsDocument(),
    ...buildServiceDocuments(),
    ...buildPortfolioDocuments(),
    ...buildTeamMemberDocuments(),
    buildAboutPageDocument(),
    buildContactPageDocument(),
    buildHomePageDocument(),
  ];
}

/** Stable `_id` list for dry-run / CLI logging (core only). */
export function listCoreSeedDocumentIds(): string[] {
  return buildCoreSeedDocuments().map((doc) => doc._id);
}

/**
 * Full seed set in mutation order:
 * services → portfolio → team → singletons → partners → awards → blog → home LAST.
 */
export function buildAllSeedDocuments(): SeedDocument[] {
  return [
    ...buildServiceDocuments(),
    ...buildPortfolioDocuments(),
    ...buildTeamMemberDocuments(),
    buildAboutPageDocument(),
    buildContactPageDocument(),
    buildSiteSettingsDocument(),
    ...buildPartnerDocuments(),
    ...buildAwardDocuments(),
    ...buildBlogSeedDocuments(),
    buildHomePageDocument(),
  ];
}

/** Stable `_id` list for full dry-run / CLI logging. */
export function listAllSeedDocumentIds(): string[] {
  return buildAllSeedDocuments().map((doc) => doc._id);
}
