/**
 * CLI argument parsing for the hero parallax plate pipeline.
 * Building plates is always safe; uploads require an explicit `--apply`.
 */

import { isMediaTarget, type MediaTarget } from "./upload";

export const DEFAULT_OUT_DIR = ".cache/hero-parallax";
export const ALL_TARGETS: readonly MediaTarget[] = ["staging", "production"];

export type HeroParallaxCliOptions = {
  /** Directory holding the raw `layer-<n>` exports. */
  sourceDir: string;
  /** Where keyed plates and the preview composite are written. */
  outDir: string;
  /** Media buckets to upload to. */
  targets: MediaTarget[];
  /** False keeps everything local. */
  apply: boolean;
  /** Also upload the raw exports, so the plates stay reproducible. */
  includeSources: boolean;
};

function readOption(argv: readonly string[], name: string): string | null {
  const flag = `--${name}`;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] ?? "";

    if (arg === flag) {
      return argv[index + 1] ?? null;
    }

    if (arg.startsWith(`${flag}=`)) {
      return arg.slice(flag.length + 1);
    }
  }

  return null;
}

function readTargets(argv: readonly string[]): MediaTarget[] {
  const raw = readOption(argv, "target");
  if (!raw || raw === "all") {
    return [...ALL_TARGETS];
  }

  const requested = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const unknown = requested.filter((value) => !isMediaTarget(value));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown --target ${unknown.join(", ")}. Expected one of: ${ALL_TARGETS.join(", ")}, all.`,
    );
  }

  // Dedupe so `--target staging,staging` does not upload twice.
  return [...new Set(requested.filter(isMediaTarget))];
}

export function parseHeroParallaxArgs(argv: readonly string[]): HeroParallaxCliOptions {
  const flags = new Set(argv);
  const sourceDir = readOption(argv, "source");

  if (!sourceDir) {
    throw new Error(
      "Missing --source <dir>. Point it at the directory holding the raw layer-1..layer-4 exports.",
    );
  }

  const forceDryRun = flags.has("--dry-run") || flags.has("-n");

  return {
    sourceDir,
    outDir: readOption(argv, "out") ?? DEFAULT_OUT_DIR,
    targets: readTargets(argv),
    apply: flags.has("--apply") && !forceDryRun,
    includeSources: !flags.has("--skip-sources"),
  };
}
