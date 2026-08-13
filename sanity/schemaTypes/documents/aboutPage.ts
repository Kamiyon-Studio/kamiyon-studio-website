import { defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "storySections",
      title: "Story sections",
      type: "array",
      of: [{ type: "storySection" }],
    }),
    defineField({
      name: "timelineHeading",
      title: "Timeline heading",
      type: "string",
      initialValue: "Our journey",
    }),
    defineField({
      name: "timelineSummary",
      title: "Timeline summary",
      type: "text",
    }),
    defineField({
      name: "timelineEntries",
      title: "Timeline entries",
      type: "array",
      of: [{ type: "storyTimelineEntry" }],
      description: "Leave empty until real milestones are ready to publish.",
    }),
    defineField({
      name: "mission",
      title: "Mission",
      type: "text",
      description: "Shown in the Who we are band on /about. Skip empty cells.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "vision",
      title: "Vision",
      type: "text",
      description:
        "Shown in the Who we are band on /about as Vision (aspirational — never as current fact). Skip empty cells.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "motto",
      title: "Motto",
      type: "string",
      description: "Shown in the Who we are band on /about. Skip empty cells.",
      validation: (r) => r.required(),
      initialValue: "Create. Play. Inspire.",
    }),
    defineField({
      name: "values",
      title: "Values",
      type: "array",
      of: [{ type: "coreValue" }],
      description:
        "Each value name + description appears as a cell in the Who we are band on /about. Skip empty cells.",
    }),
    defineField({
      name: "cultureSummary",
      title: "Culture summary",
      type: "text",
      description:
        "Shown as Culture in the Who we are band on /about. Skip empty cells.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "teamIntro",
      title: "Team intro",
      type: "text",
      description:
        "Optional intro cell in the Who we are band on /about. Skip when empty.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seoMetadata",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: "About Page" }),
  },
});
