import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const configuration = ts.parseConfigFileTextToJson(
  "wrangler.jsonc",
  readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../../wrangler.jsonc"), "utf8"),
);

describe("Cloudflare publishing configuration", () => {
  it("parses and binds cache regeneration and invalidation in every environment", () => {
    expect(configuration.error).toBeUndefined();
    const config = configuration.config;
    for (const environment of [config, config.env.staging, config.env.production]) {
      expect(environment.durable_objects.bindings).toEqual(expect.arrayContaining([
        { name: "NEXT_CACHE_DO_QUEUE", class_name: "DOQueueHandler" },
        { name: "NEXT_TAG_CACHE_DO_SHARDED", class_name: "DOShardedTagCache" },
      ]));
      expect(environment.services).toContainEqual({
        binding: "WORKER_SELF_REFERENCE", service: environment.name,
      });
    }
    expect(config.migrations).toContainEqual({
      tag: "v1-cache", new_sqlite_classes: ["DOQueueHandler", "DOShardedTagCache"],
    });
  });

  it("keeps staging cache and media isolated and shared content read-only", () => {
    const { staging, production } = configuration.config.env;
    expect(staging.name).not.toBe(production.name);
    const productionBuckets = production.r2_buckets.map((bucket: { bucket_name: string }) => bucket.bucket_name);
    for (const bucket of staging.r2_buckets) expect(productionBuckets).not.toContain(bucket.bucket_name);
    if (staging.vars.NEXT_PUBLIC_SANITY_DATASET === production.vars.NEXT_PUBLIC_SANITY_DATASET) {
      expect(staging.vars.CMS_CONTENT_MODE).toBe("read-only");
    }
  });
});
