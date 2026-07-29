import { defineField, defineType } from "sanity";

/** Reusable R2 media library entry for editors (no binary in Sanity). */
export const mediaAsset = defineType({
  name: "mediaAsset",
  title: "Media Asset",
  type: "document",
  readOnly: () => true,
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "asset",
      title: "R2 asset",
      type: "r2Asset",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "asset.alt" },
  },
});
