import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  ValuesHoverExpand,
  type ValuesHoverExpandItem,
} from "./values-expand-on-hover";

vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: {
    alt: string;
    src?: string;
    fill?: boolean;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    <img alt={alt} src={props.src} className={props.className} />
  ),
}));

const items: ValuesHoverExpandItem[] = [
  {
    id: "craft",
    name: "Craft",
    description: "We sweat every detail.",
    imageSrc: "https://images.unsplash.com/photo-craft",
    imageAlt: "Artisan at work",
  },
  {
    id: "trust",
    name: "Trust",
    description: "We do what we say.",
    imageSrc: "https://images.unsplash.com/photo-trust",
    imageAlt: "Handshake",
  },
];

describe("ValuesHoverExpand", () => {
  it("shows name and description for the default active item only", () => {
    render(<ValuesHoverExpand items={items} />);

    expect(screen.getByText("Craft")).toBeInTheDocument();
    expect(screen.getByText("We sweat every detail.")).toBeInTheDocument();

    expect(screen.queryByText("Trust")).not.toBeInTheDocument();
    expect(screen.queryByText("We do what we say.")).not.toBeInTheDocument();
  });

  it("reveals hovered item details and hides the previous overlay", async () => {
    render(<ValuesHoverExpand items={items} />);

    const trustStrip = screen.getByRole("button", { name: "Trust" });
    fireEvent.mouseEnter(trustStrip);

    await waitFor(() => {
      expect(screen.getByText("Trust")).toBeInTheDocument();
    });
    expect(screen.getByText("We do what we say.")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Craft")).not.toBeInTheDocument();
    });
  });

  it("supports keyboard activation of a strip", async () => {
    const user = userEvent.setup();
    render(<ValuesHoverExpand items={items} />);

    const trustStrip = screen.getByRole("button", { name: "Trust" });
    trustStrip.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText("Trust")).toBeInTheDocument();
    expect(screen.getByText("We do what we say.")).toBeInTheDocument();
  });

  it("marks the active strip with aria-pressed", async () => {
    render(<ValuesHoverExpand items={items} />);

    const craftStrip = screen.getByRole("button", { name: "Craft" });
    const trustStrip = screen.getByRole("button", { name: "Trust" });

    expect(craftStrip).toHaveAttribute("aria-pressed", "true");
    expect(trustStrip).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(trustStrip);

    await waitFor(() => {
      expect(trustStrip).toHaveAttribute("aria-pressed", "true");
    });
    expect(craftStrip).toHaveAttribute("aria-pressed", "false");
  });

  it("returns null and renders no buttons for empty items", () => {
    const { container } = render(<ValuesHoverExpand items={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
