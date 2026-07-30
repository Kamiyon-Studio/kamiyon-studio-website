import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HOME_SECTION_NAV } from "@/lib/home/section-nav";

import { HomeScrollMarker } from "./HomeScrollMarker";

const { prefersReducedMotionMock, refreshScrollTriggerMock } = vi.hoisted(
  () => ({
    prefersReducedMotionMock: vi.fn(() => false),
    refreshScrollTriggerMock: vi.fn(),
  }),
);

vi.mock("@/lib/motion/reduced-motion", () => ({
  prefersReducedMotion: () => prefersReducedMotionMock(),
}));

vi.mock("@/lib/gsap", () => ({
  refreshScrollTrigger: () => refreshScrollTriggerMock(),
}));

vi.mock("@/components/ui/ScrollMarker", () => ({
  ScrollMarker: ({
    items,
    activeIndex,
    onItemClick,
  }: {
    items: readonly { label: string }[];
    activeIndex?: number;
    onItemClick?: (index: number, label: string) => void;
  }) => (
    <nav aria-label="Mock scroll marker">
      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          aria-current={activeIndex === index ? "true" : undefined}
          onClick={() => onItemClick?.(index, item.label)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  ),
}));

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

describe("HomeScrollMarker", () => {
  beforeEach(() => {
    prefersReducedMotionMock.mockReturnValue(false);
    refreshScrollTriggerMock.mockClear();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    document.body.innerHTML = HOME_SECTION_NAV.map(
      ({ id }) => `<section id="${id}"></section>`,
    ).join("");
  });

  afterEach(() => {
    window.dispatchEvent(new Event("scrollend"));
    refreshScrollTriggerMock.mockClear();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders accessible section navigation without relying on visible labels", () => {
    render(<HomeScrollMarker />);

    expect(screen.getByLabelText("Page sections")).toBeInTheDocument();

    for (const { label } of HOME_SECTION_NAV) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("scrolls to the matching section on click via same-route helper", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();

    const servicesSection = document.getElementById("home-services");
    expect(servicesSection).not.toBeNull();
    servicesSection!.scrollIntoView = scrollIntoView;

    render(<HomeScrollMarker />);

    await user.click(screen.getByRole("button", { name: "Services" }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("syncs ScrollTrigger after smooth section scroll", async () => {
    const user = userEvent.setup();
    const servicesSection = document.getElementById("home-services");
    expect(servicesSection).not.toBeNull();
    servicesSection!.scrollIntoView = vi.fn();

    render(<HomeScrollMarker />);

    await user.click(screen.getByRole("button", { name: "Services" }));
    window.dispatchEvent(new Event("scrollend"));

    expect(refreshScrollTriggerMock).toHaveBeenCalledTimes(1);
  });

  it("uses instant scroll and skips ScrollTrigger sync under reduced motion", async () => {
    prefersReducedMotionMock.mockReturnValue(true);
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    const servicesSection = document.getElementById("home-services");
    expect(servicesSection).not.toBeNull();
    servicesSection!.scrollIntoView = scrollIntoView;

    render(<HomeScrollMarker />);

    await user.click(screen.getByRole("button", { name: "Services" }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });

    window.dispatchEvent(new Event("scrollend"));

    expect(refreshScrollTriggerMock).not.toHaveBeenCalled();
  });
});
