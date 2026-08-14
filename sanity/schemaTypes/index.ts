import { type SchemaTypeDefinition } from "sanity";

import { aboutPage } from "./documents/aboutPage";
import { award } from "./documents/award";
import { testimonial } from "./documents/testimonial";
import { author, category, post, tag } from "./documents/blog";
import { caseStudy } from "./documents/caseStudy";
import { communityItem } from "./documents/communityItem";
import { contactPage } from "./documents/contactPage";
import { homePage } from "./documents/homePage";
import { mediaAsset } from "./documents/mediaAsset";
import { partner } from "./documents/partner";
import { portfolio } from "./documents/portfolio";
import { product } from "./documents/product";
import { service } from "./documents/service";
import { serviceCategory } from "./documents/serviceCategory";
import { siteSettings } from "./documents/siteSettings";
import { teamMember } from "./documents/teamMember";
import { cta } from "./objects/cta";
import { blogBody, portableBody } from "./objects/portableText";
import { r2Asset } from "./objects/r2Asset";
import { seoMetadata } from "./objects/seoMetadata";
import {
  contactChannel,
  coreValue,
  faqItem,
  productMedia,
  storySection,
  storyTimelineEntry,
} from "./objects/shared";
import { socialLink } from "./objects/socialLink";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Objects (register before documents that reference them)
    r2Asset,
    seoMetadata,
    cta,
    socialLink,
    portableBody,
    blogBody,
    storySection,
    storyTimelineEntry,
    coreValue,
    contactChannel,
    faqItem,
    productMedia,
    // Singleton pages
    siteSettings,
    homePage,
    aboutPage,
    contactPage,
    // Active collections
    teamMember,
    service,
    portfolio,
    partner,
    award,
    testimonial,
    post,
    // Archived (readOnly — keep registered, never delete documents)
    serviceCategory,
    product,
    caseStudy,
    communityItem,
    mediaAsset,
    author,
    category,
    tag,
  ],
};
