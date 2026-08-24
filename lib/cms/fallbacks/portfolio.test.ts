import { describe, expect, it } from "vitest";

import { teamMembersFallback } from "./about";
import { awardsFallback } from "./awards";
import { portfolioItemsFallback } from "./portfolio";

describe("portfolio fallbacks", () => {
  it("keeps the sample client placeholder as client-work", () => {
    const placeholder = portfolioItemsFallback.find(
      (item) => item.slug.current === "sample-client-project-placeholder",
    );

    expect(placeholder).toMatchObject({
      projectType: "client-work",
      isPlaceholder: true,
      featured: true,
      gallery: [],
      credits: [],
      recognition: [],
      videos: [],
      externalLinks: [],
    });
    expect(placeholder?.shortDescription.length).toBeGreaterThan(0);
    expect(placeholder?.gameplay).toBeUndefined();
    expect(placeholder?.technicalDevelopment).toBeUndefined();
  });

  it("includes Eclipse as a real original-IP case study", () => {
    const eclipse = portfolioItemsFallback.find((item) => item.slug.current === "eclipse");

    expect(eclipse).toMatchObject({
      title: "Eclipse",
      projectType: "original-ip",
      clientName: "Kamiyon Studio",
      serviceType: "game-development",
      status: "in-development",
      developmentPeriod: "Global Game Jam 2026 → Present",
      isPlaceholder: false,
      featured: true,
      gallery: [],
    });
    expect(eclipse?.technicalDevelopment?.engine).toBeUndefined();
    expect(eclipse?.videos).toEqual([]);
    expect(eclipse?.externalLinks).toEqual([]);
  });

  it("credits Sherwin as Sound Designer without changing the About CEO roster", () => {
    const eclipse = portfolioItemsFallback.find((item) => item.slug.current === "eclipse");
    const sherwinCredit = eclipse?.credits.find((credit) => credit.name === "Sherwin Limosnero");
    const sherwinAbout = teamMembersFallback.find((member) => member.name === "Sherwin Limosnero");

    expect(sherwinCredit).toMatchObject({
      role: "Sound Designer",
      person: { id: "teamMember-sherwin-limosnero" },
    });
    expect(sherwinAbout?.role).toMatch(/CEO/);
    expect(teamMembersFallback).toHaveLength(6);
    expect(teamMembersFallback.map((member) => member.name)).not.toEqual(
      expect.arrayContaining([
        "Kien Serapio",
        "Xandrew Liquigan",
        "Clifford Torion",
        "Nicholas Alcantara",
        "Sharmaine Valenzuela",
      ]),
    );
  });

  it("seeds only the confirmed CIIT award on Eclipse, not on home awards", () => {
    const eclipse = portfolioItemsFallback.find((item) => item.slug.current === "eclipse");
    const serialized = JSON.stringify(eclipse);

    expect(eclipse?.recognition).toEqual([
      expect.objectContaining({
        title: "Most Fun Award",
        organization: "CIIT College of Innovation and Integrated Technology",
        year: "2026",
        note: "Global Game Jam 2026 entry",
      }),
    ]);
    expect(serialized).not.toMatch(
      /PGDX|\bSteam\b|itch\.io|\bUnity\b|\bGodot\b|player count|downloads/i,
    );
    expect(awardsFallback.map((award) => award.title).join(" ")).not.toMatch(/Most Fun Award/);
  });
});
