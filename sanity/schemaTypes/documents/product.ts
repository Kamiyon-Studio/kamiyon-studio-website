import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  readOnly: () => true,
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "tagline", title: "Tagline", type: "string", validation: (r) => r.required() }),
    defineField({ name: "genre", title: "Genre", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [{ title: "Original IP", value: "original-ip" }],
      },
      initialValue: "original-ip",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "developmentStatus",
      title: "Development status",
      type: "string",
      options: {
        list: [
          { title: "In development", value: "in-development" },
          { title: "Prototype", value: "prototype" },
          { title: "Released", value: "released" },
          { title: "TBD", value: "tbd" },
        ],
      },
      initialValue: "tbd",
      validation: (r) => r.required(),
    }),
    defineField({ name: "overview", title: "Overview", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "goals",
      title: "Goals",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "platforms",
      title: "Platforms",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "media",
      title: "Media",
      type: "array",
      of: [{ type: "productMedia" }],
    }),
    defineField({ name: "trailerUrl", title: "Trailer URL", type: "url" }),
    defineField({
      name: "isPlaceholder",
      title: "Placeholder",
      type: "boolean",
      initialValue: true,
    }),
    defineField({ name: "order", title: "Order", type: "number", validation: (r) => r.required() }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoMetadata",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "developmentStatus" },
  },
});
