import { describe, expect, it } from "vitest";

import {
  CF_BEACON_SRC,
  isDevelopmentEnv,
  resolveCloudflareBeacon,
} from "./cloudflare-web-analytics";

describe("isDevelopmentEnv", () => {
  it("treats APP_ENV=local as development", () => {
    expect(isDevelopmentEnv({ appEnv: "local" })).toBe(true);
    expect(isDevelopmentEnv({ appEnv: " local " })).toBe(true);
  });

  it("treats NODE_ENV=development as development", () => {
    expect(isDevelopmentEnv({ nodeEnv: "development" })).toBe(true);
  });

  it("treats staging and production as non-development", () => {
    expect(isDevelopmentEnv({ appEnv: "staging", nodeEnv: "production" })).toBe(
      false,
    );
    expect(
      isDevelopmentEnv({ appEnv: "production", nodeEnv: "production" }),
    ).toBe(false);
  });

  it("treats unset env as non-development", () => {
    expect(isDevelopmentEnv({})).toBe(false);
    expect(isDevelopmentEnv({ appEnv: null, nodeEnv: undefined })).toBe(false);
  });
});

describe("resolveCloudflareBeacon", () => {
  it("returns null when the token is missing", () => {
    expect(resolveCloudflareBeacon({})).toBeNull();
    expect(resolveCloudflareBeacon({ token: null })).toBeNull();
  });

  it("returns null when the token is blank", () => {
    expect(resolveCloudflareBeacon({ token: "" })).toBeNull();
    expect(resolveCloudflareBeacon({ token: "   " })).toBeNull();
  });

  it("returns null in development even with a token", () => {
    expect(
      resolveCloudflareBeacon({ token: "cf-token", nodeEnv: "development" }),
    ).toBeNull();
    expect(
      resolveCloudflareBeacon({ token: "cf-token", appEnv: "local" }),
    ).toBeNull();
  });

  it("resolves the beacon for staging and production", () => {
    expect(
      resolveCloudflareBeacon({
        token: "cf-token",
        appEnv: "staging",
        nodeEnv: "production",
      }),
    ).toEqual({
      src: CF_BEACON_SRC,
      config: JSON.stringify({ token: "cf-token", spa: true }),
    });
  });

  it("trims surrounding whitespace from the token", () => {
    const beacon = resolveCloudflareBeacon({
      token: "  cf-token  ",
      appEnv: "production",
    });

    expect(beacon?.config).toBe(
      JSON.stringify({ token: "cf-token", spa: true }),
    );
  });
});
