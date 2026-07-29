import { defineField, defineType } from "sanity";

import {
  POST_CATEGORIES,
  POST_TAGS,
  toSanityListOptions,
} from "@/lib/cms/taxonomies";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  readOnly: () => true,
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "bio", title: "Bio", type: "text" }),
    defineField({ name: "avatar", title: "Avatar", type: "r2Asset" }),
  ],
  preview: {
    select: { title: "name" },
  },
});

export const category = defineType({
  name: "category",
  title: "Category",
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
  ],
  preview: {
    select: { title: "title" },
  },
});

export const tag = defineType({
  name: "tag",
  title: "Tag",
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
  ],
  preview: {
    select: { title: "title" },
  },
});

export const post = defineType({
  name: "post",
  title: "Post",
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
      name: "authors",
      title: "Authors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "teamMember" }] }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [
        {
          type: "string",
          options: {
            list: toSanityListOptions(POST_CATEGORIES),
          },
        },
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [
        {
          type: "string",
          options: {
            list: toSanityListOptions(POST_TAGS),
          },
        },
      ],
    }),
    defineField({
      name: "featuredImage",
      title: "Featured image",
      type: "r2Asset",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blogBody",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoMetadata",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "readingTimeMinutes",
      title: "Reading time (minutes)",
      type: "number",
      description: "Optional; can be computed on publish in Phase C.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({ name: "updatedAt", title: "Updated at", type: "datetime" }),
    defineField({
      name: "relatedPosts",
      title: "Related posts",
      type: "array",
      of: [{ type: "reference", to: [{ type: "post" }] }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt" },
  },
});
