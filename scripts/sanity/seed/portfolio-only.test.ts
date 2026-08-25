import { describe, expect, it } from "vitest";

import {
  buildNewPortfolioSeedDocuments,
  NEW_PORTFOLIO_SLUGS,
} from "./portfolio-only";

describe("portfolio-only seed", () => {
  it("targets only the three new portfolio slugs", () => {
    expect(NEW_PORTFOLIO_SLUGS).toEqual([
      "vocabu-wildlife-edition",
      "debug-log",
      "flappy-awie",
    ]);

    const ids = buildNewPortfolioSeedDocuments().map((doc) => doc._id);
    expect(ids).toEqual([
      "portfolio-vocabu-wildlife-edition",
      "portfolio-debug-log",
      "portfolio-flappy-awie",
    ]);
    expect(ids).not.toContain("portfolio-eclipse");
    expect(ids).not.toContain("portfolio-sample-client-project-placeholder");
  });
});
