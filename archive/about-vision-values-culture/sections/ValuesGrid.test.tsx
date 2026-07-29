import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ValuesHoverExpandItem } from "@/components/ui/values-expand-on-hover";
import type { CoreValue } from "@/lib/cms/types";
import { ValuesGrid } from "./ValuesGrid";

vi.mock("@/components/ui/values-expand-on-hover", () => ({
  ValuesHoverExpand: ({ items }: { items: ValuesHoverExpandItem[] }) => (
    <div data-testid="values-hover-expand">
      {items.map((item) => (
        <div key={item.id} data-testid="values-hover-expand-item">
          <span>{item.name}</span>
          <span>{item.description}</span>
          <span data-testid="values-hover-expand-item-image">{item.imageSrc}</span>
        </div>
      ))}
    </div>
  ),
}));

const values: CoreValue[] = [
  { name: "Curiosity", description: "We ask questions." },
  { name: "Education", description: "We explain clearly." },
];

describe("ValuesGrid", () => {
  it("sets the #values anchor id and renders the section heading", () => {
    const { container } = render(<ValuesGrid values={values} />);

    expect(container.querySelector("#values")).not.toBeNull();
    expect(screen.getByText("What we value")).toBeInTheDocument();
  });

  it("renders ValuesHoverExpand with mapped items containing name, description, and image data", () => {
    render(<ValuesGrid values={values} />);

    expect(screen.getByTestId("values-hover-expand")).toBeInTheDocument();
    expect(screen.getByText("Curiosity")).toBeInTheDocument();
    expect(screen.getByText("We ask questions.")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("We explain clearly.")).toBeInTheDocument();

    const images = screen.getAllByTestId("values-hover-expand-item-image");
    expect(images).toHaveLength(2);
    images.forEach((image) => {
      expect(image.textContent).toMatch(/^https:\/\/images\.unsplash\.com\//);
    });
  });

  it("maps a value with an unrecognized name to a fallback image instead of crashing", () => {
    render(
      <ValuesGrid
        values={[{ name: "Mystery Value", description: "Something unexpected." }]}
      />
    );

    expect(screen.getByText("Mystery Value")).toBeInTheDocument();
    expect(screen.getByText("Something unexpected.")).toBeInTheDocument();
    expect(
      screen.getByTestId("values-hover-expand-item-image").textContent
    ).toMatch(/^https:\/\/images\.unsplash\.com\//);
  });

  it("renders section chrome even when there are no values", () => {
    const { container } = render(<ValuesGrid values={[]} />);

    expect(container.querySelector("#values")).not.toBeNull();
    expect(screen.getByText("What we value")).toBeInTheDocument();
    expect(screen.getByTestId("values-hover-expand")).toBeInTheDocument();
  });
});
