import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      validation: (r) => r.required(),
      initialValue: "Kamiyon Studio",
    }),
    defineField({ name: "tagline", title: "Tagline", type: "text", validation: (r) => r.required() }),
    defineField({ name: "publicEmail", title: "Public email", type: "string" }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [{ type: "socialLink" }],
    }),
    defineField({
      name: "defaultSeo",
      title: "Default SEO",
      type: "seoMetadata",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "globalCtas",
      title: "Global CTAs",
      type: "array",
      of: [{ type: "cta" }],
    }),
    defineField({ name: "footerText", title: "Footer text", type: "text" }),
    defineField({
      name: "footerMarqueeKeywords",
      title: "Footer marquee keywords",
      type: "array",
      of: [{ type: "string" }],
      initialValue: [
        "Games",
        "EdTech",
        "Portfolio",
        "Interactive Experiences",
        "Contact",
      ],
    }),
    defineField({
      name: "footerCtaHeading",
      title: "Footer CTA heading",
      type: "string",
      initialValue: "Ready to begin?",
    }),
    defineField({
      name: "footerSecondaryCtaLabel",
      title: "Footer secondary CTA label",
      type: "string",
      initialValue: "View portfolio",
    }),
    defineField({
      name: "footerSecondaryCtaHref",
      title: "Footer secondary CTA href",
      type: "string",
      initialValue: "/portfolio",
    }),
    defineField({
      name: "footerCopyrightSuffix",
      title: "Footer copyright suffix",
      type: "string",
      initialValue: "All rights reserved.",
    }),
    defineField({
      name: "footerLocationPrefix",
      title: "Footer location prefix",
      type: "string",
      initialValue: "Based in ",
    }),
    defineField({
      name: "footerLocation",
      title: "Footer location",
      type: "string",
      initialValue: "Biñan City, Laguna, Philippines",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
