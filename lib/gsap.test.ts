import { describe, expect, it } from "vitest";

import { createScrollTriggerDefaults } from "@/lib/gsap";
import {
  MOTION_DISTANCE,
  MOTION_DURATION,
  MOTION_EASE,
  MOTION_STAGGER,
  SCROLL_SCRUB_SMOOTH,
  SCROLL_SCRUB_UI,
  SCROLL_TRIGGER_START,
} from "@/lib/motion/constants";

describe("scroll scrub tokens", () => {
  it("exports shared scrub lag for parallax and shorter UI scrubs", () => {
    expect(SCROLL_SCRUB_SMOOTH).toBe(0.65);
    expect(SCROLL_SCRUB_UI).toBe(0.45);
    expect(SCROLL_TRIGGER_START).toBe("top 85%");
  });

  it("keeps MOTION_* API stable for downstream consumers", () => {
    expect(MOTION_DURATION.base).toBeGreaterThan(0);
    expect(MOTION_EASE.out).toContain("power");
    expect(MOTION_DISTANCE.parallax).toBeGreaterThan(0);
    expect(MOTION_STAGGER.base).toBeGreaterThan(0);
  });
});

describe("createScrollTriggerDefaults", () => {
  it("sets markers false and a sensible start", () => {
    const defaults = createScrollTriggerDefaults();
    expect(defaults.markers).toBe(false);
    expect(defaults.start).toBe(SCROLL_TRIGGER_START);
    expect(defaults.toggleActions).toBe("play none none none");
  });

  it("does not force scrub on enter-once reveals", () => {
    const defaults = createScrollTriggerDefaults({ once: true });
    expect(defaults.scrub).toBeUndefined();
    expect(defaults.toggleActions).toBe("play none none none");
    expect(defaults.once).toBe(true);
  });

  it("omits toggleActions when scrub is provided", () => {
    const defaults = createScrollTriggerDefaults({ scrub: true });
    expect(defaults.scrub).toBe(true);
    expect(defaults.toggleActions).toBeUndefined();
  });

  it("accepts numeric scrub tokens as opt-in without changing reveal defaults", () => {
    const smooth = createScrollTriggerDefaults({ scrub: SCROLL_SCRUB_SMOOTH });
    const ui = createScrollTriggerDefaults({ scrub: SCROLL_SCRUB_UI });

    expect(smooth.scrub).toBe(SCROLL_SCRUB_SMOOTH);
    expect(smooth.toggleActions).toBeUndefined();
    expect(ui.scrub).toBe(SCROLL_SCRUB_UI);
    expect(ui.toggleActions).toBeUndefined();

    const reveal = createScrollTriggerDefaults();
    expect(reveal.scrub).toBeUndefined();
  });

  it("merges options immutably without forcing pin", () => {
    const defaults = createScrollTriggerDefaults({ once: true, start: "top 70%" });
    expect(defaults.once).toBe(true);
    expect(defaults.start).toBe("top 70%");
    expect(defaults.pin).toBeUndefined();
  });
});
