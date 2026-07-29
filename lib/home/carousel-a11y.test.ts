import { describe, expect, it } from "vitest";

import {
  clampCarouselIndex,
  formatCarouselSlideLabel,
  getRovingTabIndex,
  wrapCarouselIndex,
} from "./carousel-a11y";

describe("formatCarouselSlideLabel", () => {
  it("formats a 1-based slide label with title", () => {
    expect(formatCarouselSlideLabel(0, 4, "Game Development")).toBe(
      "Slide 1 of 4: Game Development"
    );
  });

  it("uses the correct index for middle slides", () => {
    expect(formatCarouselSlideLabel(2, 5, "Product Development")).toBe(
      "Slide 3 of 5: Product Development"
    );
  });
});

describe("wrapCarouselIndex", () => {
  it("advances to the next slide", () => {
    expect(wrapCarouselIndex(1, 1, 4)).toBe(2);
  });

  it("wraps from the last slide to the first when advancing", () => {
    expect(wrapCarouselIndex(3, 1, 4)).toBe(0);
  });

  it("moves to the previous slide", () => {
    expect(wrapCarouselIndex(2, -1, 4)).toBe(1);
  });

  it("wraps from the first slide to the last when going back", () => {
    expect(wrapCarouselIndex(0, -1, 4)).toBe(3);
  });

  it("returns 0 when total is zero", () => {
    expect(wrapCarouselIndex(0, 1, 0)).toBe(0);
  });
});

describe("getRovingTabIndex", () => {
  it("returns 0 for the active tab", () => {
    expect(getRovingTabIndex(2, 2)).toBe(0);
  });

  it("returns -1 for inactive tabs", () => {
    expect(getRovingTabIndex(2, 0)).toBe(-1);
    expect(getRovingTabIndex(2, 3)).toBe(-1);
  });
});

describe("clampCarouselIndex", () => {
  it("clamps negative indices to 0", () => {
    expect(clampCarouselIndex(-2, 4)).toBe(0);
  });

  it("clamps indices beyond the last slide", () => {
    expect(clampCarouselIndex(9, 4)).toBe(3);
  });

  it("returns 0 when total is zero", () => {
    expect(clampCarouselIndex(2, 0)).toBe(0);
  });
});
