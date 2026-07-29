import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ScrollMarker } from "./ScrollMarker";

const ITEMS = [
  { label: "Hero" },
  { label: "Partners" },
  { label: "Projects", pointer: "pointer-custom" },
] as const;

describe("ScrollMarker", () => {
  it("renders bar markers with accessible names and no visible labels", () => {
    const { container } = render(
      <ScrollMarker items={ITEMS} activeIndex={0} />,
    );

    const block = container.querySelector(".scroll-marker-block");
    expect(block).not.toBeNull();
    expect(block).toHaveAttribute("aria-label", "Page sections");
    expect(block).not.toHaveClass("blend-mode--difference");

    for (const { label } of ITEMS) {
      const button = screen.getByRole("button", { name: label });
      expect(button).toBeInTheDocument();
      expect(button.querySelector(".scroll-marker__bar")).not.toBeNull();
      expect(button.querySelector(".sr-only")).toHaveTextContent(label);
    }

    expect(container.querySelector(".label")).toBeNull();
    expect(container.querySelectorAll(".scroll-marker__bar")).toHaveLength(
      ITEMS.length,
    );
  });

  it("marks the active item with aria-current and defaults data-pointer", () => {
    render(<ScrollMarker items={ITEMS} activeIndex={1} />);

    const partners = screen.getByRole("button", { name: "Partners" });
    const hero = screen.getByRole("button", { name: "Hero" });
    const projects = screen.getByRole("button", { name: "Projects" });

    expect(partners).toHaveAttribute("aria-current", "true");
    expect(partners).toHaveClass("is-active");
    expect(hero).toHaveAttribute("aria-current", "false");
    expect(hero).toHaveAttribute("data-pointer", "pointer-1");
    expect(partners).toHaveAttribute("data-pointer", "pointer-2");
    expect(projects).toHaveAttribute("data-pointer", "pointer-custom");
    expect(partners).toHaveAttribute("data-label", "Partners");
  });

  it("calls onItemClick with index and label", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();

    render(
      <ScrollMarker items={ITEMS} activeIndex={0} onItemClick={onItemClick} />,
    );

    await user.click(screen.getByRole("button", { name: "Projects" }));

    expect(onItemClick).toHaveBeenCalledWith(2, "Projects");
  });
});
