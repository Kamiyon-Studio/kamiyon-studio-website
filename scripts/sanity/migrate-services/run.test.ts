import { describe, expect, it, vi } from "vitest";

import type { SanityClient } from "@sanity/client";

import { WRITE_TOKEN_ENV } from "../seed/client";
import { gate0ExpectedInventory } from "./plan";
import { runMigration } from "./run";

describe("runMigration", () => {
  it("dry-run (default path) plans Gate 0 inventory and does not apply", async () => {
    const applyPlan = vi.fn();
    const logs: string[] = [];

    const result = await runMigration(
      { dryRun: true, apply: false, allowProd: false },
      {
        discover: async () => gate0ExpectedInventory(),
        applyPlan,
        log: (message) => {
          logs.push(message);
        },
      },
    );

    expect(result.dryRun).toBe(true);
    expect(result.applied).toBe(false);
    expect(applyPlan).not.toHaveBeenCalled();
    expect(result.plan.ops.some((op) => op.kind === "merge")).toBe(true);
    expect(result.statusSummary).toContain("merge=");
    expect(logs.some((line) => line.includes("DRY-RUN"))).toBe(true);
    expect(logs.some((line) => line.includes("no mutations"))).toBe(true);
  });

  it("refuses --apply on kamiyon without --allow-prod", async () => {
    await expect(
      runMigration(
        {
          dryRun: false,
          apply: true,
          allowProd: false,
          dataset: "kamiyon",
        },
        {
          discover: async () => gate0ExpectedInventory(),
          log: () => undefined,
        },
      ),
    ).rejects.toThrow(/allow-prod|protected dataset/i);
  });

  it("apply without write token fails after prod guard", async () => {
    await expect(
      runMigration(
        {
          dryRun: false,
          apply: true,
          allowProd: true,
          dataset: "kamiyon",
        },
        {
          discover: async () => gate0ExpectedInventory(),
          resolveToken: () => undefined,
          log: () => undefined,
        },
      ),
    ).rejects.toThrow(WRITE_TOKEN_ENV);
  });

  it("apply with allow-prod + token invokes applyPlan", async () => {
    const applyPlan = vi.fn(async () => ({ applied: 3 }));
    const client = {} as SanityClient;

    const result = await runMigration(
      {
        dryRun: false,
        apply: true,
        allowProd: true,
        dataset: "kamiyon",
      },
      {
        discover: async () => gate0ExpectedInventory(),
        resolveToken: () => "test-write-token",
        createWriteClient: () => client,
        applyPlan,
        log: () => undefined,
      },
    );

    expect(result.applied).toBe(true);
    expect(result.dryRun).toBe(false);
    expect(applyPlan).toHaveBeenCalledOnce();
  });
});
