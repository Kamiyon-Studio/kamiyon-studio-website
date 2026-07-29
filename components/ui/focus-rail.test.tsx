import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
  it("renders the active item title and counter", () => {
    render(<FocusRail items={ITEMS} />);

    expect(screen.getByTestId("focus-rail")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Neon Tokyo" })).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("advances to the next item when Next is clicked", async () => {
    const user = userEvent.setup();
    render(<FocusRail items={ITEMS} />);

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Nordic Silence" }),
    ).toBeInTheDocument();
  });

  it("shows Explore only when the active item has href", async () => {
    const user = userEvent.setup();
    render(<FocusRail items={ITEMS} />);

    expect(screen.queryByRole("link", { name: /explore/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("link", { name: /explore/i })).toHaveAttribute(
      "href",
      "#nordic",
    );
  });

  it("returns null when items is empty", () => {
    const { container } = render(<FocusRail items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("loops from last to first when loop is enabled", async () => {
    const user = userEvent.setup();
    render(<FocusRail items={ITEMS} initialIndex={2} loop />);

    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Neon Tokyo" }),
    ).toBeInTheDocument();
  });
});
