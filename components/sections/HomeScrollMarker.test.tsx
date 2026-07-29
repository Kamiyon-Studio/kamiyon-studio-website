import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HOME_SECTION_NAV } from "@/lib/home/section-nav";

import { HomeScrollMarker } from "./HomeScrollMarker";

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
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    document.body.innerHTML = HOME_SECTION_NAV.map(
      ({ id }) => `<section id="${id}"></section>`,
    ).join("");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders accessible section navigation without relying on visible labels", () => {
    render(<HomeScrollMarker />);

    expect(screen.getByLabelText("Page sections")).toBeInTheDocument();

    for (const { label } of HOME_SECTION_NAV) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("scrolls to the matching section on click", async () => {
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
});
