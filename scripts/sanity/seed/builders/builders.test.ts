import { describe, expect, it } from "vitest";

import { caseStudiesFallback } from "@/lib/cms/fallbacks/portfolio";
import { communityItemsFallback } from "@/lib/cms/fallbacks/community";
import { homePageFallback } from "@/lib/cms/fallbacks/home";
import { productsFallback } from "@/lib/cms/fallbacks/products";
import { servicesFallback } from "@/lib/cms/fallbacks/services";
import { teamMembersFallback } from "@/lib/cms/fallbacks/about";

import {
  buildAboutPageDocument,
  buildCaseStudyDocuments,
  buildCommunityItemDocuments,
  buildContactPageDocument,
  buildCoreSeedDocuments,
  buildHomePageDocument,
  buildProductDocuments,
  buildServiceDocuments,
  buildSiteSettingsDocument,
  buildTeamMemberDocuments,
  listCoreSeedDocumentIds,
} from "./index";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

describe("WS8b core seed builders", () => {
  it("emits singleton stable IDs", () => {
    expect(buildSiteSettingsDocument()._id).toBe("siteSettings");
    expect(buildHomePageDocument()._id).toBe("homePage");
    expect(buildAboutPageDocument()._id).toBe("aboutPage");
    expect(buildContactPageDocument()._id).toBe("contactPage");
  });

  it("emits collection stable IDs as {type}-{slug} (hyphen; not path-private)", () => {
    expect(buildProductDocuments().map((d) => d._id)).toEqual([
      "product-eclipse",
      "product-vocabu-wildlife-edition",
      "product-afterschool-cleanup",
    ]);
    expect(buildCaseStudyDocuments().map((d) => d._id)).toEqual([
      "portfolio-sample-client-project-placeholder",
    ]);
    expect(buildTeamMemberDocuments().map((d) => d._id)).toEqual([
      "teamMember-sherwin-limosnero",
      "teamMember-christian-jude-villaber",
      "teamMember-ken-cabingas",
      "teamMember-luis-cabrido-iii",
      "teamMember-lucky-guevarra",
      "teamMember-yushua-dapilaga",
    ]);
    expect(buildServiceDocuments().map((d) => d._id)).toEqual([
      "service-game-development",
      "service-product-development",
      "service-ui-design",
      "service-branding",
      "service-community-events",
    ]);
    expect(buildCommunityItemDocuments().map((d) => d._id)).toEqual([
      "communityItem-workshop-details-coming-soon",
      "communityItem-partnership-details-coming-soon",
    ]);
  });

  it("preserves isPlaceholder: true from fallbacks", () => {
    for (const doc of buildProductDocuments()) {
      expect(doc.isPlaceholder).toBe(true);
    }
    for (const doc of buildCaseStudyDocuments()) {
      expect(doc.isPlaceholder).toBe(true);
    }
    for (const doc of buildTeamMemberDocuments()) {
      expect(doc.isPlaceholder).toBe(true);
    }
    for (const doc of buildServiceDocuments()) {
      expect(doc.isPlaceholder).toBe(true);
    }
    for (const doc of buildCommunityItemDocuments()) {
      expect(doc.isPlaceholder).toBe(true);
    }

    // Sanity-check against source fallbacks so we don't invent flags.
    expect(productsFallback.every((p) => p.isPlaceholder === true)).toBe(true);
    expect(caseStudiesFallback.every((c) => c.isPlaceholder === true)).toBe(true);
    expect(teamMembersFallback.every((m) => m.isPlaceholder === true)).toBe(true);
    expect(servicesFallback.every((s) => s.isPlaceholder === true)).toBe(true);
    expect(communityItemsFallback.every((c) => c.isPlaceholder === true)).toBe(
      true
    );
  });

  it("maps home named fields to Sanity references (no blocks)", () => {
    const home = buildHomePageDocument();

    expect(home).not.toHaveProperty("blocks");
    expect(Array.isArray(home.partners)).toBe(true);
    expect(Array.isArray(home.portfolioItems)).toBe(true);
    expect(Array.isArray(home.awards)).toBe(true);
    expect(Array.isArray(home.services)).toBe(true);
    expect(isRecord(home.contactCta)).toBe(true);

    expect(home.contactCta).toMatchObject({
      title: homePageFallback.contactCta.title,
      body: homePageFallback.contactCta.body,
      ctaLabel: homePageFallback.contactCta.ctaLabel,
      ctaHref: homePageFallback.contactCta.ctaHref,
    });

    const portfolioRefs = home.portfolioItems as unknown[];
    expect(portfolioRefs.length).toBeGreaterThan(0);
    expect(portfolioRefs.every((ref) => isRecord(ref) && ref._type === "reference")).toBe(
      true,
    );

    const serviceRefs = home.services as unknown[];
    expect(serviceRefs).toHaveLength(5);
    expect(serviceRefs.every((ref) => isRecord(ref) && ref._type === "reference")).toBe(
      true,
    );
  });

  it("maps flat service fields (tagline + capabilities; no category)", () => {
    const docs = buildServiceDocuments();
    expect(docs).toHaveLength(servicesFallback.length);
    expect(docs).toHaveLength(5);

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]!;
      const source = servicesFallback[i]!;
      expect(doc).not.toHaveProperty("categorySlug");
      expect(doc).not.toHaveProperty("category");
      expect(doc).not.toHaveProperty("outcomes");
      expect(doc).not.toHaveProperty("relatedIndustries");
      expect(doc.tagline).toBe(source.tagline);
      expect(doc.capabilities).toEqual([...source.capabilities]);
    }
  });

  it("skips media fields (empty or omitted)", () => {
    for (const doc of buildProductDocuments()) {
      expect(doc.media).toEqual([]);
    }
    for (const doc of buildCaseStudyDocuments()) {
      expect(doc.gallery).toEqual([]);
      expect(doc).not.toHaveProperty("coverImage");
    }
    for (const doc of buildTeamMemberDocuments()) {
      expect(doc).not.toHaveProperty("photo");
    }
    for (const doc of buildCommunityItemDocuments()) {
      expect(doc).not.toHaveProperty("coverImage");
    }

    const home = buildHomePageDocument();
    expect(home).not.toHaveProperty("blocks");
    expect(JSON.stringify(home)).not.toMatch(/"_type":"hero"/);

    const site = buildSiteSettingsDocument();
    expect(isRecord(site.defaultSeo) && !("ogImage" in site.defaultSeo)).toBe(
      true
    );
  });

  it("shapes slug fields as Sanity slug objects", () => {
    expect(buildProductDocuments()[0]?.slug).toEqual({
      _type: "slug",
      current: "eclipse",
    });
    expect(buildServiceDocuments()[0]?.slug).toEqual({
      _type: "slug",
      current: "game-development",
    });
  });

  it("buildCoreSeedDocuments gathers expected counts and unique IDs", () => {
    const docs = buildCoreSeedDocuments();
    // site + 5 services + 1 portfolio + 6 team + about + contact + home = 16
    expect(docs).toHaveLength(16);

    const ids = docs.map((d) => d._id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(listCoreSeedDocumentIds()).toEqual(ids);

    // Home appears after portfolio so featured refs can resolve.
    const homeIndex = ids.indexOf("homePage");
    const portfolioIndex = ids.indexOf(
      "portfolio-sample-client-project-placeholder",
    );
    expect(homeIndex).toBeGreaterThan(portfolioIndex);
    expect(ids).not.toContain("product-eclipse");
    expect(ids).not.toContain("communityItem-workshop-details-coming-soon");
  });

  it("preserves contact channel isPlaceholder from channels source", () => {
    const contact = buildContactPageDocument();
    const channels = contact.channels as Array<{ isPlaceholder?: boolean }>;
    expect(channels.every((c) => c.isPlaceholder === false)).toBe(true);
  });
});
