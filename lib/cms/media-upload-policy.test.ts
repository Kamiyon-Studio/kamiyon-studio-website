import { describe, expect, it } from "vitest";

import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  isAllowedUploadMimeType,
  isWithinUploadSizeLimit,
  normalizeMimeType,
  parseContentLength,
} from "./media-upload-policy";

describe("media-upload-policy", () => {
  describe("normalizeMimeType", () => {
    it("lowercases and strips parameters", () => {
      expect(normalizeMimeType("Image/PNG")).toBe("image/png");
      expect(normalizeMimeType("image/jpeg; charset=binary")).toBe(
        "image/jpeg",
      );
      expect(normalizeMimeType("  IMAGE/WEBP  ")).toBe("image/webp");
    });

    it("returns empty for blank input", () => {
      expect(normalizeMimeType("")).toBe("");
      expect(normalizeMimeType("   ")).toBe("");
    });
  });

  describe("isAllowedUploadMimeType", () => {
    it("allows png, jpeg, webp, gif, avif", () => {
      for (const mime of ALLOWED_UPLOAD_MIME_TYPES) {
        expect(isAllowedUploadMimeType(mime)).toBe(true);
      }
      expect(isAllowedUploadMimeType("IMAGE/JPEG")).toBe(true);
      expect(isAllowedUploadMimeType("image/png; charset=binary")).toBe(true);
    });

    it("rejects svg, html, pdf, empty, and octet-stream", () => {
      expect(isAllowedUploadMimeType("image/svg+xml")).toBe(false);
      expect(isAllowedUploadMimeType("text/html")).toBe(false);
      expect(isAllowedUploadMimeType("application/pdf")).toBe(false);
      expect(isAllowedUploadMimeType("")).toBe(false);
      expect(isAllowedUploadMimeType("application/octet-stream")).toBe(false);
    });
  });

  describe("isWithinUploadSizeLimit", () => {
    it("accepts sizes at or under the 10 MiB cap", () => {
      expect(MAX_UPLOAD_BYTES).toBe(10 * 1024 * 1024);
      expect(isWithinUploadSizeLimit(0)).toBe(true);
      expect(isWithinUploadSizeLimit(MAX_UPLOAD_BYTES)).toBe(true);
    });

    it("rejects oversized payloads", () => {
      expect(isWithinUploadSizeLimit(MAX_UPLOAD_BYTES + 1)).toBe(false);
    });
  });

  describe("parseContentLength", () => {
    it("parses valid Content-Length headers", () => {
      expect(parseContentLength("1024")).toBe(1024);
      expect(parseContentLength("0")).toBe(0);
    });

    it("returns null for missing or invalid values", () => {
      expect(parseContentLength(null)).toBe(null);
      expect(parseContentLength("")).toBe(null);
      expect(parseContentLength("abc")).toBe(null);
      expect(parseContentLength("-1")).toBe(null);
      expect(parseContentLength("1.5")).toBe(null);
    });
  });
});
