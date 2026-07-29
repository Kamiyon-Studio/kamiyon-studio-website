import { defineField, defineType } from "sanity";

export const storySection = defineType({
  name: "storySection",
  title: "Story section",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Body", type: "text", validation: (r) => r.required() }),
  ],
});

export const storyTimelineEntry = defineType({
  name: "storyTimelineEntry",
  title: "Story timeline entry",
  type: "object",
  fields: [
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      description: "Four-digit year for the year rail (e.g. 2024).",
      validation: (r) =>
        r
          .required()
          .regex(/^\d{4}$/, { name: "yyyy", invert: false }),
    }),
    defineField({
      name: "dateLabel",
      title: "Date label",
      type: "string",
      description: 'Human-readable display date (e.g. "March 2024").',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "date",
      title: "ISO date",
      type: "string",
      description: "Optional ISO date for semantic <time dateTime> (e.g. 2024-03-01).",
    }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Body", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "image",
      title: "Image",
      type: "r2Asset",
      validation: (r) =>
        r.required().custom((value) => {
          if (!value || typeof value !== "object") {
            return "Image is required";
          }
          const asset = value as {
            url?: unknown;
            key?: unknown;
            mimeType?: unknown;
          };
          const url = typeof asset.url === "string" ? asset.url.trim() : "";
          const key = typeof asset.key === "string" ? asset.key.trim() : "";
          if (!url && !key) {
            return "Image URL or R2 key is required";
          }
          if (
            typeof asset.mimeType === "string" &&
            asset.mimeType.trim() &&
            !asset.mimeType.trim().toLowerCase().startsWith("image/")
          ) {
            return "Timeline entries require an image asset";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "dateLabel" },
  },
});

export const coreValue = defineType({
  name: "coreValue",
  title: "Core value",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (r) => r.required(),
    }),
  ],
});

export const contactChannel = defineType({
  name: "contactChannel",
  title: "Contact channel",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Facebook", value: "facebook" },
          { title: "LinkedIn", value: "linkedin" },
          { title: "itch.io", value: "itch" },
          { title: "YouTube", value: "youtube" },
          { title: "X", value: "x" },
          { title: "Email", value: "email" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "value", title: "Value", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "isPlaceholder",
      title: "Placeholder",
      type: "boolean",
      initialValue: true,
    }),
  ],
});

export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ item",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "answer", title: "Answer", type: "text", validation: (r) => r.required() }),
  ],
});

export const productMedia = defineType({
  name: "productMedia",
  title: "Product media",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "asset", title: "Asset", type: "r2Asset" }),
    defineField({ name: "alt", title: "Alt text", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
});

export const homeHighlight = defineType({
  name: "homeHighlight",
  title: "Highlight",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (r) => r.required(),
    }),
    defineField({ name: "icon", title: "Icon", type: "string" }),
  ],
});
