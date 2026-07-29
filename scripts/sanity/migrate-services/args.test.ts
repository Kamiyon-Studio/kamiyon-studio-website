import { describe, expect, it } from "vitest";

import {
  ProdApplyBlockedError,
  assertApplyAllowed,
  isProtectedDataset,
  parseMigrateArgs,
} from "./args";

describe("parseMigrateArgs", () => {
  it("defaults to dry-run (no --apply)", () => {
    expect(parseMigrateArgs([])).toEqual({
      dryRun: true,
      apply: false,
      allowProd: false,
    });
  });

  it("enables apply only with explicit --apply", () => {
    expect(parseMigrateArgs(["--apply"])).toEqual({
      dryRun: false,
      apply: true,
      allowProd: false,
    });
  });

  it("keeps dry-run when both --dry-run and --apply are passed", () => {
    expect(parseMigrateArgs(["--apply", "--dry-run"])).toEqual({
      dryRun: true,
      apply: false,
      allowProd: false,
    });
    expect(parseMigrateArgs(["--apply", "-n"]).dryRun).toBe(true);
  });

  it("parses --allow-prod", () => {
    expect(parseMigrateArgs(["--apply", "--allow-prod"]).allowProd).toBe(true);
  });
});

describe("assertApplyAllowed", () => {
  it("allows dry-run on protected datasets", () => {
    expect(() =>
      assertApplyAllowed({ apply: false, allowProd: false }, "kamiyon"),
    ).not.toThrow();
  });

  it("blocks --apply on kamiyon/prod without --allow-prod", () => {
    expect(isProtectedDataset("kamiyon")).toBe(true);
    expect(isProtectedDataset("production")).toBe(true);
    expect(() =>
      assertApplyAllowed({ apply: true, allowProd: false }, "kamiyon"),
    ).toThrow(ProdApplyBlockedError);
  });

  it("allows --apply on protected dataset with --allow-prod", () => {
    expect(() =>
      assertApplyAllowed({ apply: true, allowProd: true }, "kamiyon"),
    ).not.toThrow();
  });

  it("allows --apply on non-protected datasets without --allow-prod", () => {
    expect(() =>
      assertApplyAllowed({ apply: true, allowProd: false }, "development"),
    ).not.toThrow();
  });
});
