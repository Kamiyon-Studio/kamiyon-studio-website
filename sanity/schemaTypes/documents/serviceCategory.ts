import { defineField, defineType } from "sanity";

/**
 * Obsolete under Gate 0 / ADR-016 (flat five services).
 * Kept registered + readOnly so existing dataset docs are not deleted;
 * Studio desks this under Archive. WS-C migration removes documents.
 */
export const serviceCategory = defineType({
  name: "serviceCategory",
  title: "Service Category (archived)",
  type: "document",
  description:
    "Deprecated — categories are no longer used. Do not create new documents. Pending deletion after migration.",
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
      name: "description",
      title: "Description",
      type: "text",
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Order", type: "number", validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "title" },
  },
});
