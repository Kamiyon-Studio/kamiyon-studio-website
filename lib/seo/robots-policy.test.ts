import { describe, expect, it } from "vitest";

import { buildRobotsPolicy } from "./robots-policy";

describe("buildRobotsPolicy", () => {
  it("allows the public site and blocks admin/API on the production canonical host", () => {
    const policy = buildRobotsPolicy("https://kamiyonstudio.com", "production");

    expect(policy).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/studio",
          "/studio/",
          "/motion-lab",
          "/motion-lab/",
        ],
      },
      sitemap: "https://kamiyonstudio.com/sitemap.xml",
      host: "kamiyonstudio.com",
    });
  });

  it("allows crawl when APP_ENV is unset and SITE_URL is canonical (local)", () => {
    const policy = buildRobotsPolicy("https://kamiyonstudio.com");

    expect(policy).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/studio",
          "/studio/",
          "/motion-lab",
          "/motion-lab/",
        ],
      },
      sitemap: "https://kamiyonstudio.com/sitemap.xml",
      host: "kamiyonstudio.com",
    });
  });

  it("disallows all and omits sitemap for preview with production SITE_URL", () => {
    const policy = buildRobotsPolicy(
      "https://kamiyonstudio.com",
      "preview"
    );

    expect(policy).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
    expect(policy).not.toHaveProperty("sitemap");
  });

  it("disallows all for development APP_ENV even with canonical SITE_URL", () => {
    const policy = buildRobotsPolicy(
      "https://kamiyonstudio.com",
      "development"
    );

    expect(policy.rules).toEqual({
      userAgent: "*",
      disallow: "/",
    });
    expect(policy).not.toHaveProperty("sitemap");
  });

  it("disallows all crawlers and omits sitemap for localhost", () => {
    const policy = buildRobotsPolicy("http://localhost:3000");

    expect(policy).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    });
    expect(policy).not.toHaveProperty("sitemap");
  });

  it("disallows all crawlers for Vercel preview hosts", () => {
    const policy = buildRobotsPolicy(
      "https://kamiyon-studio-website-git-frontend-example.vercel.app"
    );

    expect(policy.rules).toEqual({
      userAgent: "*",
      disallow: "/",
    });
    expect(policy).not.toHaveProperty("sitemap");
  });

  it("disallows all crawlers when SITE_URL is http on the production host", () => {
    const policy = buildRobotsPolicy("http://kamiyonstudio.com");

    expect(policy.rules).toEqual({
      userAgent: "*",
      disallow: "/",
    });
    expect(policy).not.toHaveProperty("sitemap");
  });

  it("disallows all crawlers for www (non-canonical) host", () => {
    const policy = buildRobotsPolicy("https://www.kamiyonstudio.com");

    expect(policy.rules).toEqual({
      userAgent: "*",
      disallow: "/",
    });
    expect(policy).not.toHaveProperty("sitemap");
  });

  it("always blocks /admin even when allow rules are present", () => {
    const policy = buildRobotsPolicy("https://kamiyonstudio.com", "production");
    const disallow = Array.isArray(policy.rules)
      ? policy.rules.flatMap((rule) =>
          Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]
        )
      : Array.isArray(policy.rules.disallow)
        ? policy.rules.disallow
        : [policy.rules.disallow];

    expect(disallow).toEqual(expect.arrayContaining(["/admin", "/admin/"]));
  });
});
