import { describe, expect, it } from "vitest";

import { DISPLAY_HEADING_CLASS } from "./display-heading";

describe("DISPLAY_HEADING_CLASS", () => {
  it("uses a shared responsive scale without decorative glow", () => {
    expect(DISPLAY_HEADING_CLASS).toContain("font-display");
    expect(DISPLAY_HEADING_CLASS).toContain("text-balance");
    expect(DISPLAY_HEADING_CLASS).not.toContain("footer-text-glow");
  });
});
