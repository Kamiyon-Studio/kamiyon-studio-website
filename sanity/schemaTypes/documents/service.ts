import { defineArrayMember, defineField, defineType } from "sanity";

import { CANONICAL_SERVICE_SLUGS } from "../constants";

const CANONICAL_SLUG_SET = new Set<string>(CANONICAL_SERVICE_SLUGS);

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  description:
    "One of five fixed studio offerings. Edit via Services in the desk — do not create extras.",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Public service name (e.g. Game Development).",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Must be one of the five Gate 0 slugs. Do not invent new offerings.",
      options: { source: "title", maxLength: 96 },
      validation: (r) =>
        r.required().custom((value) => {
          const current = value?.current;
          if (!current) return "Slug is required";
          if (!CANONICAL_SLUG_SET.has(current)) {
            return `Slug must be one of: ${CANONICAL_SERVICE_SLUGS.join(", ")}`;
          }
          return true;
        }),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Short line under the title on listing and detail pages.",
      validation: (r) => r.required().max(160),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,
      description: "Plain-text description used in cards and SEO fallbacks.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableBody",
      description: "Optional longer copy. Can start as the same text as Summary.",
    }),
    defineField({
      name: "capabilities",
      title: "Capabilities",
      type: "array",
      description: "Concrete offerings under this service (replaces Outcomes).",
      of: [defineArrayMember({ type: "string" })],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "relatedIndustries",
      title: "Related industries",
      type: "array",
      description: "Optional. Prefer Capabilities for public copy; industries band may be unused.",
      of: [defineArrayMember({ type: "string" })],
      deprecated: {
        reason: "Not in the Gate 0 brief — omit from new content; prefer capabilities.",
      },
      hidden: ({ value }) => value === undefined,
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Optional UI glyph key for cards (not required by the brief).",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Display order — must be 1–5 matching the five canonical services.",
      validation: (r) => r.required().integer().min(1).max(5),
    }),
    defineField({
      name: "isPlaceholder",
      title: "Placeholder",
      type: "boolean",
      description: "Keep checked until real copy/media replaces seed content.",
      initialValue: true,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoMetadata",
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "tagline", order: "order" },
    prepare({ title, subtitle, order }) {
      return {
        title: typeof order === "number" ? `${order}. ${title ?? "Service"}` : (title ?? "Service"),
        subtitle: subtitle || "Service",
      };
    },
  },
});
