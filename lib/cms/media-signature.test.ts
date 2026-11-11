import { expect, it } from "vitest";
import { matchesImageType } from "./media-signature";
it.each(["image/png", "image/gif", "image/jpeg", "image/webp", "image/avif"])("rejects text with spoofed %s", (type) => {
  expect(matchesImageType(new TextEncoder().encode("arbitrary content".repeat(5)), type)).toBe(false);
});
it("rejects truncated AVIF type boxes", () => {
  const bytes = new Uint8Array(24);
  new DataView(bytes.buffer).setUint32(0, 1000);
  bytes.set(new TextEncoder().encode("ftypavif"), 4);
  expect(matchesImageType(bytes, "image/avif")).toBe(false);
});

it.each(["png", "gif", "jpeg", "webp", "avif"] as const)("accepts a real %s image and rejects its truncated container", async (format) => {
  const sharp = (await import("sharp")).default;
  const bytes = new Uint8Array(await sharp({ create: { width: 2, height: 2, channels: 3, background: "red" } }).toFormat(format).toBuffer());
  const type = `image/${format}`;
  expect(matchesImageType(bytes, type)).toBe(true);
  expect(matchesImageType(bytes.slice(0, 24), type)).toBe(false);
  expect(matchesImageType(bytes.slice(0, bytes.length - 3), type)).toBe(false);
});
