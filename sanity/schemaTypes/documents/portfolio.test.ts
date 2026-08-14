import { describe, expect, it } from "vitest";

import { portfolio } from "./portfolio";

function fieldNames(type: typeof portfolio): string[] {
  return (type.fields ?? []).map((field) => field.name);
}

function fieldByName(type: typeof portfolio, name: string) {
  return (type.fields ?? []).find((field) => field.name === name);
}

function groupNames(type: typeof portfolio): string[] {
  return (type.groups ?? []).map((group) =>
    typeof group === "object" && group && "name" in group ? String(group.name) : "",
  );
}

describe("portfolio schema (lean case study)", () => {
  it("keeps the challenge → solution → impact spine and r2 media", () => {
    const names = fieldNames(portfolio);
    expect(names).toEqual(
      expect.arrayContaining([
        "title",
        "slug",
        "clientName",
        "industry",
        "serviceType",
        "challenge",
        "solution",
        "impact",
        "lessonsLearned",
        "coverImage",
        "gallery",
        "featured",
        "isPlaceholder",
        "publishedAt",
        "seo",
      ]),
    );
    expect(fieldByName(portfolio, "coverImage")).toMatchObject({ type: "r2Asset" });
    expect(fieldByName(portfolio, "seo")).toMatchObject({ type: "seoMetadata" });
  });

  it("adds required projectType and shortDescription with Studio groups", () => {
    expect(groupNames(portfolio)).toEqual([
      "information",
      "overview",
      "case-study",
      "gameplay",
      "development",
      "credits",
      "media",
      "seo",
    ]);

    const projectType = fieldByName(portfolio, "projectType");
    expect(projectType).toMatchObject({
      type: "string",
      initialValue: "client-work",
      group: "information",
    });
    expect(projectType?.validation).toBeTypeOf("function");

    const shortDescription = fieldByName(portfolio, "shortDescription");
    expect(shortDescription).toMatchObject({ type: "text", group: "overview" });
    expect(shortDescription?.validation).toBeTypeOf("function");

    expect(fieldByName(portfolio, "clientName")).toMatchObject({
      title: "Client / Owner",
    });
  });

  it("keeps Eclipse-depth groups optional and does not add a wiki of required essays", () => {
    const names = fieldNames(portfolio);
    expect(names).toEqual(
      expect.arrayContaining([
        "status",
        "developmentPeriod",
        "positioning",
        "creativeDirection",
        "process",
        "narrative",
        "gameplay",
        "technicalDevelopment",
        "credits",
        "recognition",
        "videos",
        "externalLinks",
      ]),
    );

    expect(fieldByName(portfolio, "status")?.validation).toBeUndefined();
    expect(fieldByName(portfolio, "narrative")?.validation).toBeUndefined();
    expect(fieldByName(portfolio, "gameplay")?.validation).toBeUndefined();
    expect(fieldByName(portfolio, "technicalDevelopment")?.validation).toBeUndefined();
    expect(fieldByName(portfolio, "credits")?.validation).toBeUndefined();

    expect(names).not.toContain("world");
    expect(names).not.toContain("visage");
    expect(names).not.toContain("veiled");
    expect(names).not.toContain("protagonist");
    expect(names).not.toContain("testimonial");
    expect(names).not.toContain("developmentProcess");
    expect(names).not.toContain("team");
  });
});
