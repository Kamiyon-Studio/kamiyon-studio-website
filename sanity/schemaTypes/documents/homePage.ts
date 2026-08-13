import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * RFC — Sanity ↔ Frontend Align §1.1
 * Named fields (not a block renderer). Studio order matches frontend bands.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "partners",
      title: "Partners",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "partner" }] })],
    }),
    defineField({
      name: "portfolioItems",
      title: "Portfolio items",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "portfolio" }] })],
    }),
    defineField({
      name: "awards",
      title: "Awards",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "award" }] })],
    }),
    defineField({
      name: "services",
      title: "Services",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "service" }] })],
    }),
    defineField({
      name: "contactCta",
      title: "Contact CTA",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "body",
          title: "Body",
          type: "text",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "ctaLabel",
          title: "CTA label",
          type: "string",
          validation: (r) => r.required(),
        }),
        defineField({
          name: "ctaHref",
          title: "CTA href",
          type: "string",
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoMetadata",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home Page" }),
  },
});
