import { defineField, defineType } from "sanity";

export const communityItem = defineType({
  name: "communityItem",
  title: "Community Item",
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
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Workshop", value: "workshop" },
          { title: "Hackathon", value: "hackathon" },
          { title: "Game jam", value: "game-jam" },
          { title: "Speaking", value: "speaking" },
          { title: "Education", value: "education" },
          { title: "Partnership", value: "partnership" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "summary", title: "Summary", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableBody",
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", title: "Date", type: "date" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "coverImage", title: "Cover image", type: "r2Asset" }),
    defineField({ name: "externalUrl", title: "External URL", type: "url" }),
    defineField({
      name: "isPlaceholder",
      title: "Placeholder",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoMetadata",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "type" },
  },
});
