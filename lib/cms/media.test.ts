import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildMediaPublicUrl,
  createMediaObjectKey,
  getMediaUrl,
  mapR2AssetToCmsImage,
  normalizeMediaKey,
  readImageDimensions,
  sanitizeMediaFilename,
} from "./media";

describe("getMediaUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null for missing asset", () => {
    expect(getMediaUrl(null)).toBeNull();
    expect(getMediaUrl(undefined)).toBeNull();
  });

  it("prefers an explicit public url", () => {
    expect(getMediaUrl({ url: "https://cdn.example.com/hero.png", key: "ignored" })).toBe(
      "https://cdn.example.com/hero.png",
    );
  });

  it("builds a url from key + NEXT_PUBLIC_R2_PUBLIC_BASE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_BASE_URL", "https://cdn.example.com/");
    expect(getMediaUrl({ key: "/media/hero.png" })).toBe("https://cdn.example.com/media/hero.png");
  });

  it("returns null when only key is set without a public base url", () => {
    vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_BASE_URL", "");
    expect(getMediaUrl({ key: "media/hero.png" })).toBeNull();
  });
});

describe("media key helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes keys", () => {
    expect(normalizeMediaKey("/media//hero.png")).toBe("media/hero.png");
  });

  it("sanitizes filenames and builds object keys", () => {
    expect(sanitizeMediaFilename("Hero Shot.PNG")).toBe("hero-shot.png");
    const key = createMediaObjectKey("Hero Shot.PNG", new Date("2026-07-24T00:00:00.000Z"));
    expect(key).toMatch(/^uploads\/2026\/07\/[0-9a-f-]+-hero-shot\.png$/);
  });

  it("buildMediaPublicUrl joins base + key", () => {
    vi.stubEnv("NEXT_PUBLIC_R2_PUBLIC_BASE_URL", "https://cdn.example.com/");
    expect(buildMediaPublicUrl("/a/b.png")).toBe("https://cdn.example.com/a/b.png");
  });

  it("reads PNG dimensions", () => {
    const png = Uint8Array.from(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64",
      ),
    );
    expect(readImageDimensions(png, "image/png")).toEqual({ width: 1, height: 1 });
  });
});

describe("mapR2AssetToCmsImage", () => {
  it("returns undefined for empty input", () => {
    expect(mapR2AssetToCmsImage(null)).toBeUndefined();
    expect(mapR2AssetToCmsImage({})).toBeUndefined();
  });

  it("maps url, alt, and caption", () => {
    expect(
      mapR2AssetToCmsImage({
        url: "https://cdn.example.com/a.png",
        alt: "Alt",
        caption: "Caption",
        _key: "k1",
      }),
    ).toEqual({
      _key: "k1",
      url: "https://cdn.example.com/a.png",
      alt: "Alt",
      caption: "Caption",
    });
  });
});

it.each([{ width: 2, height: 2 }, { width: 257, height: 129 }])("reads standalone VP8L lossless WebP dimensions %o", async ({ width, height }) => {
  const sharp = (await import("sharp")).default;
  const bytes = new Uint8Array(await sharp({ create: { width, height, channels: 3, background: "red" } }).webp({ lossless: true }).toBuffer());
  expect(new TextDecoder().decode(bytes.slice(12, 16))).toBe("VP8L");
  expect(readImageDimensions(bytes)).toEqual({ width, height });
});
