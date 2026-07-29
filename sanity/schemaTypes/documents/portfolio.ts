import { defineField, defineType } from "sanity";

import {
  SERVICE_CATEGORIES,
  toSanityListOptions,
} from "@/lib/cms/taxonomies";

export const portfolio = defineType({
  name: "portfolio",
  title: "Portfolio",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "clientName",
      title: "Client name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "industry", title: "Industry", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "serviceType",
      title: "Service type",
      type: "string",
      options: {
        list: toSanityListOptions(SERVICE_CATEGORIES),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "challenge",
      title: "Challenge",
      type: "text",
      validation: (r) => r.required(),
    }),
    defineField({ name: "solution", title: "Solution", type: "text", validation: (r) => r.required() }),
    defineField({ name: "impact", title: "Impact", type: "text", validation: (r) => r.required() }),
    defineField({ name: "lessonsLearned", title: "Lessons learned", type: "text" }),
    defineField({ name: "coverImage", title: "Cover image", type: "r2Asset" }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "r2Asset" }],
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isPlaceholder",
      title: "Placeholder",
      type: "boolean",
      initialValue: true,
    }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime" }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoMetadata",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "clientName" },
  },
});
