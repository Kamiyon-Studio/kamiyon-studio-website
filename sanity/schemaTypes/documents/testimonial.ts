import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  description:
    "Attributed quotes for the home testimonials band. Only publish quotes from real people who agreed to be named. The home section stays hidden until Home Page → Testimonials has at least one reference.",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      description: "The attributed quote. Do not invent or paraphrase without permission.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Person's name as they agreed to be credited.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: "Title, studio, or context (single line).",
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "r2Asset",
      description:
        "Optional portrait. Cards show initials when empty; never use stock photos.",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Studio list sort only. Home uses the Home Page testimonials array order.",
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "role" },
  },
});
