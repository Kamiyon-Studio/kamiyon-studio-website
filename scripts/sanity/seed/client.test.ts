import { afterEach, describe, expect, it, vi } from "vitest";

import { createSeedWriteClient, resolveWriteToken, WRITE_TOKEN_ENV } from "./client";

describe("resolveWriteToken", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns trimmed token or undefined", () => {
    expect(resolveWriteToken({})).toBeUndefined();
    expect(resolveWriteToken({ [WRITE_TOKEN_ENV]: "   " })).toBeUndefined();
    expect(resolveWriteToken({ [WRITE_TOKEN_ENV]: "  tok  " })).toBe("tok");
  });

  it("refuses to create a mutation client in a read-only environment", () => {
    vi.stubEnv("CMS_CONTENT_MODE", "read-only");
    expect(() => createSeedWriteClient({ token: "test-token" })).toThrow("writes are disabled");
  });
});
