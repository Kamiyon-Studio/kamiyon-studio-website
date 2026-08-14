import { defineArrayMember, defineField, defineType } from "sanity";

import {
  PORTFOLIO_LINK_KINDS,
  PORTFOLIO_PROJECT_TYPES,
  PORTFOLIO_STATUSES,
  SERVICE_CATEGORIES,
  toSanityListOptions,
} from "@/lib/cms/taxonomies";

function isGameRelated(document: { projectType?: unknown; serviceType?: unknown } | undefined) {
  return (
    document?.projectType === "original-ip" || document?.serviceType === "game-development"
  );
}

export const portfolio = defineType({
  name: "portfolio",
  title: "Portfolio",
  type: "document",
  groups: [
    { name: "information", title: "Information", default: true },
    { name: "overview", title: "Overview" },
    { name: "case-study", title: "Case study" },
    { name: "gameplay", title: "Gameplay" },
    { name: "development", title: "Development" },
    { name: "credits", title: "Credits & recognition" },
    { name: "media", title: "Media" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "information",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "information",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "projectType",
      title: "Project type",
      type: "string",
      group: "information",
      options: {
        list: toSanityListOptions(PORTFOLIO_PROJECT_TYPES),
        layout: "radio",
      },
      initialValue: "client-work",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "clientName",
      title: "Client / Owner",
      type: "string",
      group: "information",
      description: "Client for commissioned work; studio name for original IP.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "information",
      options: {
        list: toSanityListOptions(PORTFOLIO_STATUSES),
        layout: "radio",
      },
    }),
    defineField({
      name: "developmentPeriod",
      title: "Development period",
      type: "string",
      group: "information",
      description: "e.g. Global Game Jam 2026 → Present",
    }),
    defineField({
      name: "industry",
      title: "Industry",
      type: "string",
      group: "information",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "serviceType",
      title: "Service type",
      type: "string",
      group: "information",
      options: {
        list: toSanityListOptions(SERVICE_CATEGORIES),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "information",
      initialValue: false,
    }),
    defineField({
      name: "isPlaceholder",
      title: "Placeholder",
      type: "boolean",
      group: "information",
      initialValue: true,
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "information",
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      group: "overview",
      description: "Used on listing cards and the case-study hero.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "positioning",
      title: "Positioning",
      type: "string",
      group: "overview",
      description: "Optional one-liner for the case-study hero only.",
    }),
    defineField({
      name: "challenge",
      title: "Challenge",
      type: "text",
      group: "case-study",
      description: "The development problem — not a game synopsis.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "solution",
      title: "Solution",
      type: "text",
      group: "case-study",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "impact",
      title: "Impact",
      type: "text",
      group: "case-study",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "lessonsLearned",
      title: "Lessons learned",
      type: "text",
      group: "case-study",
    }),
    defineField({
      name: "creativeDirection",
      title: "Creative direction",
      type: "portableBody",
      group: "case-study",
      description: "Optional. Visual/design philosophy can also live in Solution.",
    }),
    defineField({
      name: "process",
      title: "Process",
      type: "portableBody",
      group: "case-study",
      description: "Optional notes. Do not model a six-step development process here.",
    }),
    defineField({
      name: "narrative",
      title: "Narrative",
      type: "portableBody",
      group: "gameplay",
      hidden: ({ document }) => !isGameRelated(document),
    }),
    defineField({
      name: "gameplay",
      title: "Gameplay",
      type: "object",
      group: "gameplay",
      hidden: ({ document }) => !isGameRelated(document),
      fields: [
        defineField({
          name: "mechanics",
          title: "Mechanics",
          type: "portableBody",
        }),
        defineField({
          name: "dualStateTable",
          title: "Dual-state table",
          type: "object",
          fields: [
            defineField({
              name: "leftLabel",
              title: "Left column",
              type: "string",
            }),
            defineField({
              name: "rightLabel",
              title: "Right column",
              type: "string",
            }),
            defineField({
              name: "rows",
              title: "Rows",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "gameplayDualStateRow",
                  fields: [
                    defineField({ name: "aspect", title: "Aspect", type: "string" }),
                    defineField({ name: "left", title: "Left value", type: "string" }),
                    defineField({ name: "right", title: "Right value", type: "string" }),
                  ],
                  preview: {
                    select: { title: "aspect", subtitle: "left" },
                  },
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: "controls",
          title: "Controls",
          type: "array",
          of: [
            defineArrayMember({
              type: "object",
              name: "gameplayControl",
              fields: [
                defineField({ name: "input", title: "Input", type: "string" }),
                defineField({ name: "action", title: "Action", type: "string" }),
              ],
              preview: {
                select: { title: "input", subtitle: "action" },
              },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "technicalDevelopment",
      title: "Technical development",
      type: "object",
      group: "development",
      fields: [
        defineField({
          name: "engine",
          title: "Engine",
          type: "string",
          description: "Leave blank if unknown. Do not invent an engine.",
        }),
        defineField({
          name: "platforms",
          title: "Platforms",
          type: "string",
        }),
        defineField({
          name: "input",
          title: "Input",
          type: "string",
        }),
        defineField({
          name: "origin",
          title: "Development origin",
          type: "string",
          description: "e.g. Global Game Jam 2026",
        }),
        defineField({
          name: "systems",
          title: "Systems built",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
          description: "Only systems actually built. Do not list planned features.",
        }),
        defineField({
          name: "body",
          title: "Notes",
          type: "portableBody",
        }),
      ],
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      group: "credits",
      of: [
        defineArrayMember({
          type: "object",
          name: "portfolioCredit",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "role",
              title: "Project role",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "person",
              title: "Team member",
              type: "reference",
              to: [{ type: "teamMember" }],
              description:
                "Optional About-roster link. Project role stays on this credit.",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role" },
          },
        }),
      ],
    }),
    defineField({
      name: "recognition",
      title: "Recognition",
      type: "array",
      group: "credits",
      description: "Project-specific accolades. Do not duplicate home award docs here.",
      of: [
        defineArrayMember({
          type: "object",
          name: "portfolioRecognition",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "organization",
              title: "Organization",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "year",
              title: "Year",
              type: "string",
              validation: (r) => r.regex(/^\d{4}$/, { name: "four-digit year" }),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (r) => r.uri({ scheme: ["http", "https"] }),
            }),
            defineField({
              name: "note",
              title: "Note",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "organization" },
          },
        }),
      ],
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "r2Asset",
      group: "media",
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      group: "media",
      of: [{ type: "r2Asset" }],
    }),
    defineField({
      name: "videos",
      title: "Videos",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "object",
          name: "portfolioVideo",
          fields: [
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
            }),
            defineField({ name: "title", title: "Title", type: "string" }),
          ],
          preview: {
            select: { title: "title", subtitle: "url" },
          },
        }),
      ],
    }),
    defineField({
      name: "externalLinks",
      title: "External links",
      type: "array",
      group: "media",
      of: [
        defineArrayMember({
          type: "object",
          name: "portfolioExternalLink",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
            }),
            defineField({
              name: "kind",
              title: "Kind",
              type: "string",
              options: { list: toSanityListOptions(PORTFOLIO_LINK_KINDS) },
              initialValue: "website",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoMetadata",
      group: "seo",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      clientName: "clientName",
      projectType: "projectType",
    },
    prepare({ title, clientName, projectType }) {
      const kind = projectType === "original-ip" ? "Original IP" : "Client work";
      return {
        title: title || "Portfolio",
        subtitle: [kind, clientName].filter(Boolean).join(" · "),
      };
    },
  },
});
