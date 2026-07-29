import { afterEach, describe, expect, it, vi } from "vitest";

import { getCmsImageUrl, isAllowedNextImageSrc } from "./image";

describe("isAllowedNextImageSrc", () => {
  it("allows local public paths", () => {
    expect(isAllowedNextImageSrc("/assets/background.jpg")).toBe(true);
  });

  it("allows Kamiyon media CDN hosts", () => {
    expect(isAllowedNextImageSrc("https://media.kamiyonstudio.com/covers/a.png")).toBe(true);
    expect(isAllowedNextImageSrc("https://media-staging.kamiyonstudio.com/covers/a.png")).toBe(
      true,
    );
  });

  it("rejects non-CDN hosts (e.g. itch.io pages mistaken for covers)", () => {
    expect(isAllowedNextImageSrc("https://kamiyon-studio.itch.io/eclipse")).toBe(false);
  });

  it("rejects empty and protocol-relative values", () => {
    expect(isAllowedNextImageSrc("")).toBe(false);
    expect(isAllowedNextImageSrc("//cdn.example.com/a.png")).toBe(false);
  });
});

describe("getCmsImageUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when the image has no url or key", () => {
    expect(getCmsImageUrl({ alt: "no url" })).toBeNull();
  });

  it("returns null when the image is null or undefined", () => {
    expect(getCmsImageUrl(null)).toBeNull();
    expect(getCmsImageUrl(undefined)).toBeNull();
  });

  it("returns the public R2 url when present on an allowlisted host", () => {
    expect(
      getCmsImageUrl({ url: "https://media.kamiyonstudio.com/hero.png", alt: "Hero" }),
    ).toBe("https://media.kamiyonstudio.com/hero.png");
  });

  it("returns null for non-allowlisted absolute urls", () => {
    expect(getCmsImageUrl({ url: "https://kamiyon-studio.itch.io/eclipse", alt: "Eclipse" })).toBe(
      null,
    );
  });

  it("resolves key via NEXT_PUBLIC_R2_PUBLIC_BASE_URL when host is allowlisted", () => {
    vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_BASE_URL", "https://media.kamiyonstudio.com");
    expect(getCmsImageUrl({ key: "media/hero.png", alt: "Hero" })).toBe(
      "https://media.kamiyonstudio.com/media/hero.png",
    );
  });

  it("returns null when key resolves to a non-allowlisted host", () => {
    vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_BASE_URL", "https://cdn.example.com");
    expect(getCmsImageUrl({ key: "media/hero.png", alt: "Hero" })).toBeNull();
  });
});
