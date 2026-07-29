import { defineArrayMember, defineField, defineType } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "headline", title: "Headline", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "subheadline",
      title: "Subheadline",
      type: "text",
      validation: (r) => r.required(),
    }),
    defineField({ name: "ctaLabel", title: "CTA label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "ctaHref", title: "CTA href", type: "string", validation: (r) => r.required() }),
    defineField({ name: "image", title: "Hero image", type: "r2Asset" }),
  ],
});

export const mission = defineType({
  name: "mission",
  title: "Mission",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Body", type: "text", validation: (r) => r.required() }),
  ],
});

export const featuredWork = defineType({
  name: "featuredWork",
  title: "Featured work",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Body", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "featuredProducts",
      title: "Featured products",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "featuredCaseStudies",
      title: "Featured portfolio items",
      type: "array",
      of: [{ type: "reference", to: [{ type: "portfolio" }] }],
    }),
  ],
});

export const highlights = defineType({
  name: "highlights",
  title: "Highlights",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [defineArrayMember({ type: "homeHighlight" })],
    }),
  ],
});

export const ctaBanner = defineType({
  name: "ctaBanner",
  title: "CTA banner",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Body", type: "text", validation: (r) => r.required() }),
    defineField({ name: "ctaLabel", title: "CTA label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "ctaHref", title: "CTA href", type: "string", validation: (r) => r.required() }),
  ],
});

export const homeBlockTypes = [hero, mission, featuredWork, highlights, ctaBanner] as const;
