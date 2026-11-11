import { afterEach, describe, expect, it, vi } from "vitest";

import { canUseDemoContent, resolveWithFallback } from "./resolve";

type TestContent = {
  title?: string;
};

describe("resolveWithFallback", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("never serves fixtures in deployed environments", () => {
    vi.stubEnv("CMS_DEMO_CONTENT", "true");
    for (const environment of ["production", "staging"]) {
      vi.stubEnv("APP_ENV", environment);
      expect(canUseDemoContent()).toBe(false);
      expect(resolveWithFallback(null, ["sample"])).toEqual([]);
      expect(() => resolveWithFallback(null, { title: "Sample" })).toThrow("not published");
    }
  });

  it("requires an explicit demo opt-in outside tests", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("APP_ENV", "local");
    vi.stubEnv("CMS_DEMO_CONTENT", "");
    expect(canUseDemoContent()).toBe(false);
    vi.stubEnv("CMS_DEMO_CONTENT", "true");
    expect(canUseDemoContent()).toBe(true);
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_ENV", "");
    expect(canUseDemoContent()).toBe(false);
  });

  const fallback: TestContent = {
    title: "Fallback title",
  };

  it("returns CMS content when a non-null value is provided", () => {
    const content: TestContent = {
      title: "CMS title",
    };

    expect(resolveWithFallback(content, fallback)).toBe(content);
  });

  it("returns fallback content when CMS content is null", () => {
    expect(resolveWithFallback(null, fallback)).toBe(fallback);
  });

  it("returns fallback content when CMS content is undefined", () => {
    expect(resolveWithFallback(undefined, fallback)).toBe(fallback);
  });

  it("preserves an empty CMS object as intentional content", () => {
    const content: TestContent = {};

    expect(resolveWithFallback(content, fallback)).toBe(content);
  });

  it("preserves falsy primitive CMS content", () => {
    expect(resolveWithFallback(0, 1)).toBe(0);
  });
});
