import { describe, expect, it } from "vitest";

import { hasControlCharacters, sanitizeHeaderValue } from "./sanitize";

describe("hasControlCharacters", () => {
  it("detects CRLF and bare CR/LF/tab/NUL/DEL", () => {
    expect(hasControlCharacters("Ada\r\nBcc: evil@x.com")).toBe(true);
    expect(hasControlCharacters("Ada\rLovelace")).toBe(true);
    expect(hasControlCharacters("Ada\nLovelace")).toBe(true);
    expect(hasControlCharacters("Ada\tLovelace")).toBe(true);
    expect(hasControlCharacters("Ada\0Lovelace")).toBe(true);
    expect(hasControlCharacters("Ada\u001fLovelace")).toBe(true);
    expect(hasControlCharacters("Ada\u007fLovelace")).toBe(true);
  });

  it("detects Unicode line/paragraph separators", () => {
    expect(hasControlCharacters("Ada\u2028Lovelace")).toBe(true);
    expect(hasControlCharacters("Ada\u2029Lovelace")).toBe(true);
  });

  it("allows clean international names", () => {
    expect(hasControlCharacters("Adá 上田")).toBe(false);
    expect(hasControlCharacters("Ada Lovelace")).toBe(false);
    expect(hasControlCharacters("José María")).toBe(false);
  });
});

describe("sanitizeHeaderValue", () => {
  it("strips control characters and collapses whitespace", () => {
    expect(sanitizeHeaderValue("Ada\r\nBcc: evil@x.com")).toBe(
      "Ada Bcc: evil@x.com",
    );
    expect(sanitizeHeaderValue("  Ada\t\n  Lovelace  ")).toBe("Ada Lovelace");
    expect(sanitizeHeaderValue("Ada\u2028\u2029Lovelace")).toBe("Ada Lovelace");
  });

  it("preserves clean international names", () => {
    expect(sanitizeHeaderValue("Adá 上田")).toBe("Adá 上田");
  });
});
