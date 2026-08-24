import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FocusRail, type FocusRailItem } from "./focus-rail";

const ITEMS: FocusRailItem[] = [
  {
    id: 1,
    title: "Neon Tokyo",
    description: "Vibrant nightlife.",
    meta: "Urban",
    imageSrc:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Nordic Silence",
    description: "Minimalist coast.",
    meta: "Nature",
    imageSrc:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1000&auto=format&fit=crop",
    href: "#nordic",
  },
  {
    id: 3,
    title: "Sahara Echoes",
    imageSrc:
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1000&auto=format&fit=crop",
  },
];

describe("FocusRail", () => {
  it("renders a minimized active label without description", () => {
    render(<FocusRail items={ITEMS} />);

    expect(screen.getByTestId("focus-rail")).toBeInTheDocument();
    expect(screen.getByText("Neon Tokyo")).toBeInTheDocument();
    expect(screen.getByText("Urban")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(screen.queryByText("Vibrant nightlife.")).not.toBeInTheDocument();
    expect(screen.queryByTestId("focus-rail-modal")).not.toBeInTheDocument();
  });

  it("advances to the next item when Next is clicked", async () => {
    const user = userEvent.setup();
    render(<FocusRail items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(await screen.findByText("Nordic Silence")).toBeInTheDocument();
  });

  it("opens a details modal with description when the label is clicked", async () => {
    const user = userEvent.setup();
    render(<FocusRail items={ITEMS} />);

    await user.click(
      screen.getByRole("button", { name: /open details for neon tokyo/i }),
    );

    const modal = await screen.findByTestId("focus-rail-modal");
    expect(modal).toBeInTheDocument();
    expect(
      within(modal).getByRole("heading", { name: "Neon Tokyo" }),
    ).toBeInTheDocument();
    expect(within(modal).getByText("Vibrant nightlife.")).toBeInTheDocument();

    const card = within(modal).getByTestId("focus-rail-modal-card");
    expect(card.className).toMatch(/max-h-\[min\(90dvh/);
    expect(card.className).toMatch(/overflow-hidden/);
  });

  it("shows Explore inside the modal when the active item has href", async () => {
    const user = userEvent.setup();
    render(<FocusRail items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(
      screen.getByRole("button", { name: /open details for nordic silence/i }),
    );

    const modal = await screen.findByTestId("focus-rail-modal");
    expect(within(modal).getByRole("link", { name: /explore/i })).toHaveAttribute(
      "href",
      "#nordic",
    );
  });

  it("returns null when items is empty", () => {
    const { container } = render(<FocusRail items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps the rail transparent instead of a grey fill", () => {
    render(<FocusRail items={ITEMS} />);
    const rail = screen.getByTestId("focus-rail");

    expect(rail.className).not.toMatch(/bg-neutral-950/);
    expect(rail.className).not.toMatch(/bg-neutral-900/);
  });

  it("does not paint a pink atmosphere behind the cards", () => {
    render(<FocusRail items={ITEMS} />);

    expect(
      screen.queryByTestId("focus-rail-atmosphere-tint"),
    ).not.toBeInTheDocument();

    const atmosphere = screen.getByTestId("focus-rail-atmosphere");
    expect(atmosphere.innerHTML).not.toMatch(/--color-primary/);
    expect(atmosphere.innerHTML).not.toMatch(/mix-blend-color/);
  });

  it("frames every visible card at the same 9:16 portrait size", () => {
    const { container } = render(<FocusRail items={ITEMS} />);
    const cards = container.querySelectorAll('[data-testid="focus-rail-card"]');

    expect(cards.length).toBe(5);
    cards.forEach((card) => {
      expect(card.className).toMatch(/aspect-\[9\/16\]/);
    });
  });

  it("wraps each visible card in the hover-only glowing stroke", () => {
    const { container } = render(<FocusRail items={ITEMS} />);
    const strokes = container.querySelectorAll(".glowing-shadow--card");

    expect(strokes.length).toBe(5);
  });

  it("loops from last to first when loop is enabled", async () => {
    const user = userEvent.setup();
    render(<FocusRail items={ITEMS} initialIndex={2} loop />);

    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(await screen.findByText("Neon Tokyo")).toBeInTheDocument();
  });
});
