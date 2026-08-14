import { describe, expect, it } from "vitest";

import { portfolioItemsFallback } from "@/lib/cms/fallbacks/portfolio";

import { buildPortfolioDocuments } from "./portfolio";
import { buildTeamMemberDocuments } from "./team";

describe("portfolio seed builder", () => {
  it("emits deterministic ids for Eclipse and the client placeholder", () => {
    expect(buildPortfolioDocuments().map((doc) => doc._id)).toEqual([
      "portfolio-eclipse",
      "portfolio-sample-client-project-placeholder",
    ]);
  });

  it("marks Eclipse as a published original IP and keeps the placeholder as client-work", () => {
    const [eclipse, placeholder] = buildPortfolioDocuments();

    expect(eclipse).toMatchObject({
      _id: "portfolio-eclipse",
      projectType: "original-ip",
      clientName: "Kamiyon Studio",
      isPlaceholder: false,
      featured: true,
      status: "in-development",
      gallery: [],
    });
    expect(eclipse).not.toHaveProperty("coverImage");
    expect(eclipse?.technicalDevelopment).not.toHaveProperty("engine");
    expect(eclipse).not.toHaveProperty("videos");
    expect(eclipse).not.toHaveProperty("externalLinks");

    expect(placeholder).toMatchObject({
      _id: "portfolio-sample-client-project-placeholder",
      projectType: "client-work",
      isPlaceholder: true,
      gallery: [],
    });
    expect(placeholder).not.toHaveProperty("gameplay");
    expect(placeholder).not.toHaveProperty("technicalDevelopment");
    expect(placeholder).not.toHaveProperty("credits");
  });

  it("links only Sherwin's credit to the existing teamMember id", () => {
    const eclipse = buildPortfolioDocuments().find((doc) => doc._id === "portfolio-eclipse");
    const credits = eclipse?.credits as Array<Record<string, unknown>>;
    const sherwin = credits.find((credit) => credit.name === "Sherwin Limosnero");

    expect(sherwin).toMatchObject({
      role: "Sound Designer",
      person: { _type: "reference", _ref: "teamMember-sherwin-limosnero" },
    });
    expect(credits.filter((credit) => "person" in credit)).toHaveLength(1);

    expect(buildTeamMemberDocuments().map((doc) => doc._id)).toEqual([
      "teamMember-sherwin-limosnero",
      "teamMember-christian-jude-villaber",
      "teamMember-ken-cabingas",
      "teamMember-luis-cabrido-iii",
      "teamMember-lucky-guevarra",
      "teamMember-yushua-dapilaga",
    ]);
  });

  it("does not invent engine, PGDX, storefronts, or metrics", () => {
    const serialized = JSON.stringify(buildPortfolioDocuments());
    expect(serialized).not.toMatch(
      /PGDX|\bSteam\b|itch\.io|\bUnity\b|\bGodot\b|player count|downloads/i,
    );
  });

  it("emits optional portable groups, engine, and recognition urls when present", () => {
    const eclipse = portfolioItemsFallback.find((item) => item.slug.current === "eclipse");
    expect(eclipse).toBeDefined();

    const withExtras = buildPortfolioDocuments([
      {
        ...eclipse!,
        slug: { current: "eclipse-extras" },
        creativeDirection: [
          { _type: "block", children: [{ _type: "span", text: "Contrast first." }], markDefs: [] },
        ],
        process: [
          { _type: "block", children: [{ _type: "span", text: "Jam, then continue." }], markDefs: [] },
        ],
        gameplay: {
          mechanics: [
            { _type: "block", children: [{ _type: "span", text: "State is the model." }], markDefs: [] },
          ],
          controls: [],
        },
        technicalDevelopment: {
          engine: "Custom",
          platforms: "PC",
          input: "Keyboard + Mouse",
          origin: "Global Game Jam 2026",
          systems: ["Dual-state world"],
          body: [
            { _type: "block", children: [{ _type: "span", text: "Jam prototype." }], markDefs: [] },
          ],
        },
        recognition: [
          {
            title: "Most Fun Award",
            organization: "CIIT",
            year: "2026",
            url: "https://example.com/award",
            note: "Global Game Jam 2026 entry",
          },
        ],
      },
    ])[0];

    expect(withExtras).toMatchObject({
      _id: "portfolio-eclipse-extras",
    });
    expect(Array.isArray(withExtras?.creativeDirection)).toBe(true);
    expect(Array.isArray(withExtras?.process)).toBe(true);
    expect(withExtras?.technicalDevelopment).toMatchObject({ engine: "Custom" });
    expect((withExtras?.recognition as Array<{ url?: string }>)[0]?.url).toBe(
      "https://example.com/award",
    );
  });
});
