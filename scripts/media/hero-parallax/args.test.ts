import { describe, expect, it } from "vitest";

import { ALL_TARGETS, DEFAULT_OUT_DIR, parseHeroParallaxArgs } from "./args";
import {
  buildWranglerPutArgs,
  IMMUTABLE_CACHE_CONTROL,
  isMediaTarget,
  MEDIA_BUCKETS,
} from "./upload";

describe("parseHeroParallaxArgs", () => {
  it("requires a source directory", () => {
    expect(() => parseHeroParallaxArgs([])).toThrow(/Missing --source/);
  });

  it("reads options in both --flag value and --flag=value form", () => {
    expect(parseHeroParallaxArgs(["--source", "/exports"]).sourceDir).toBe("/exports");
    expect(parseHeroParallaxArgs(["--source=/exports"]).sourceDir).toBe("/exports");
  });

  it("defaults to a dry run against every media bucket", () => {
    const options = parseHeroParallaxArgs(["--source", "/exports"]);

    expect(options.apply).toBe(false);
    expect(options.targets).toEqual([...ALL_TARGETS]);
    expect(options.outDir).toBe(DEFAULT_OUT_DIR);
    expect(options.includeSources).toBe(true);
  });

  it("uploads only with an explicit --apply", () => {
    expect(parseHeroParallaxArgs(["--source", "/x", "--apply"]).apply).toBe(true);
  });

  it("lets --dry-run override --apply", () => {
    expect(
      parseHeroParallaxArgs(["--source", "/x", "--apply", "--dry-run"]).apply,
    ).toBe(false);
    expect(parseHeroParallaxArgs(["--source", "/x", "--apply", "-n"]).apply).toBe(
      false,
    );
  });

  it("accepts a single target, a comma list, and `all`", () => {
    expect(parseHeroParallaxArgs(["--source", "/x", "--target", "staging"]).targets).toEqual([
      "staging",
    ]);
    expect(
      parseHeroParallaxArgs(["--source", "/x", "--target", "staging,production"]).targets,
    ).toEqual(["staging", "production"]);
    expect(parseHeroParallaxArgs(["--source", "/x", "--target", "all"]).targets).toEqual([
      ...ALL_TARGETS,
    ]);
  });

  it("dedupes repeated targets so nothing uploads twice", () => {
    expect(
      parseHeroParallaxArgs(["--source", "/x", "--target", "staging,staging"]).targets,
    ).toEqual(["staging"]);
  });

  it("rejects an unknown target", () => {
    expect(() =>
      parseHeroParallaxArgs(["--source", "/x", "--target", "prod"]),
    ).toThrow(/Unknown --target prod/);
  });

  it("honours --out and --skip-sources", () => {
    const options = parseHeroParallaxArgs([
      "--source",
      "/x",
      "--out",
      "tmp/plates",
      "--skip-sources",
    ]);

    expect(options.outDir).toBe("tmp/plates");
    expect(options.includeSources).toBe(false);
  });
});

describe("isMediaTarget", () => {
  it("recognises the configured media buckets only", () => {
    expect(isMediaTarget("staging")).toBe(true);
    expect(isMediaTarget("production")).toBe(true);
    expect(isMediaTarget("prod")).toBe(false);
  });
});

describe("buildWranglerPutArgs", () => {
  it("targets remote R2 with an immutable cache policy by default", () => {
    const args = buildWranglerPutArgs({
      bucket: MEDIA_BUCKETS.production,
      key: "site/hero/parallax/v1/layer-1.webp",
      file: ".cache/hero-parallax/layer-1.webp",
      contentType: "image/webp",
    });

    expect(args.slice(0, 4)).toEqual([
      "r2",
      "object",
      "put",
      "kamiyon-media-prod/site/hero/parallax/v1/layer-1.webp",
    ]);
    expect(args).toContain("--remote");
    expect(args[args.indexOf("--content-type") + 1]).toBe("image/webp");
    expect(args[args.indexOf("--cache-control") + 1]).toBe(IMMUTABLE_CACHE_CONTROL);
  });

  it("allows the cache policy to be overridden", () => {
    const args = buildWranglerPutArgs({
      bucket: MEDIA_BUCKETS.staging,
      key: "k",
      file: "f",
      contentType: "image/webp",
      cacheControl: "no-store",
    });

    expect(args[args.indexOf("--cache-control") + 1]).toBe("no-store");
  });
});
