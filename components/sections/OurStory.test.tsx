import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OurStory } from "./OurStory";

vi.mock("@/components/ui/WordPullUp", () => ({
  WordPullUp: ({
    words,
    as: Tag = "h1",
    id,
  }: {
    words: string;
    as?: "h1" | "h2" | "h3";
    id?: string;
  }) => <Tag id={id}>{words}</Tag>,
}));

describe("OurStory", () => {
  it("renders the editorial heading and story sections in a responsive grid", () => {
    const { container } = render(
      <OurStory
        storySections={[
          { title: "How we started", body: "Founded in 2024." },
          { title: "Where we're headed", body: "Building original IP." },
        ]}
      />
    );

    expect(screen.getByRole("heading", { level: 2, name: "OUR STORY" })).toBeInTheDocument();
    expect(screen.getByText("How we started")).toBeInTheDocument();
    expect(screen.getByText("Founded in 2024.")).toBeInTheDocument();
    expect(screen.getByText("Where we're headed")).toBeInTheDocument();
    expect(screen.getByText("Building original IP.")).toBeInTheDocument();

    const storyGrid = container.querySelector(".grid");
    expect(storyGrid).toHaveClass("grid", "grid-cols-1", "md:grid-cols-2");
  });

  it("renders nothing when there are no story sections", () => {
    const { container } = render(<OurStory storySections={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
