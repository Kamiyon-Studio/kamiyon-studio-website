import { describe, expect, it } from "vitest";

import { servicesFallback } from "@/lib/cms/fallbacks/services";

import { serviceId } from "../ids";
import {
  buildServiceDocument,
  buildServiceDocuments,
} from "./services";

describe("buildServiceDocuments (Gate 0 flat shape)", () => {
  it("emits five service docs with stable hyphen IDs in taxonomy order", () => {
    const docs = buildServiceDocuments();
    expect(docs.map((d) => d._id)).toEqual([
      "service-game-development",
      "service-product-development",
      "service-ui-design",
      "service-branding",
      "service-community-events",
    ]);
    expect(docs.every((d) => d._type === "service")).toBe(true);
  });

  it("maps tagline and capabilities; omits category, outcomes, relatedIndustries", () => {
    const docs = buildServiceDocuments();
    expect(docs).toHaveLength(servicesFallback.length);

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]!;
      const source = servicesFallback[i]!;

      expect(doc._id).toBe(serviceId(source.slug.current));
      expect(doc.title).toBe(source.title);
      expect(doc.slug).toEqual({
        _type: "slug",
        current: source.slug.current,
      });
      expect(doc.tagline).toBe(source.tagline);
      expect(doc.summary).toBe(source.summary);
      expect(doc.capabilities).toEqual([...source.capabilities]);
      expect(doc.order).toBe(source.order);
      expect(doc.isPlaceholder).toBe(true);
      expect(doc.seo).toMatchObject({
        title: source.seo.title,
        description: source.seo.description,
      });

      expect(doc).not.toHaveProperty("category");
      expect(doc).not.toHaveProperty("categorySlug");
      expect(doc).not.toHaveProperty("outcomes");
      expect(doc).not.toHaveProperty("relatedIndustries");
    }
  });

  it("preserves optional icon when present on the fallback", () => {
    const withIcon = servicesFallback.find((s) => s.icon);
    expect(withIcon).toBeDefined();
    const doc = buildServiceDocument(withIcon!);
    expect(doc.icon).toBe(withIcon!.icon);
  });
});
