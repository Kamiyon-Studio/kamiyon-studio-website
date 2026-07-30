import { defineField, defineType } from "sanity";

/** Recognition tiers shown as the laurel eyebrow on the home badges. */
const AWARD_LABELS = [
  "Winner",
  "Finalist",
  "Nominee",
  "Official Selection",
  "Honorable Mention",
] as const;

export const award = defineType({
  name: "award",
  title: "Award",
  type: "document",
  description:
    "Recognition shown on the home laurel badges. Only publish accolades the studio has actually received.",
  fields: [
    defineField({
      name: "title",
      title: "Award title",
      type: "string",
      description:
        "Award name as awarded, e.g. \"Gameplay Design Award\". Use a line break to control where it wraps.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Recognition tier",
      type: "string",
      description: "Small caps eyebrow above the award title.",
      options: { list: AWARD_LABELS.map((value) => ({ title: value, value })) },
      initialValue: "Winner",
    }),
    defineField({
      name: "organization",
      title: "Awarding body",
      type: "string",
      description:
        "Festival, publication, or institution that gave the award. Use a line break to control where it wraps.",
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      description: "Four-digit year the award was received.",
      validation: (r) => r.regex(/^\d{4}$/, { name: "four-digit year" }),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Lower numbers appear first in the home recognition grid.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "isPlaceholder",
      title: "Placeholder",
      type: "boolean",
      description:
        "Leave on for an unfilled slot. Turn off only once this is a real, verifiable award.",
      initialValue: true,
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
    select: {
      title: "title",
      label: "label",
      year: "year",
      isPlaceholder: "isPlaceholder",
    },
    prepare({ title, label, year, isPlaceholder }) {
      const bits = [label, year, isPlaceholder ? "Placeholder" : null].filter(Boolean);
      return {
        title: title || "Award",
        subtitle: bits.join(" · "),
      };
    },
  },
});
