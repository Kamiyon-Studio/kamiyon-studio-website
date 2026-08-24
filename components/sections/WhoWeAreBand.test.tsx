import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WhoWeAreBand } from "./WhoWeAreBand";

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

describe("WhoWeAreBand", () => {
  it("renders WHO WE ARE heading and OurStory grid classes", () => {
    const { container } = render(
      <WhoWeAreBand mission="Make great games." vision="A lasting studio." />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "WHO WE ARE" }),
    ).toBeInTheDocument();

    const section = container.querySelector("section#who-we-are");
    expect(section).toHaveClass(
      "bg-[var(--color-charcoal)]",
      "py-16",
      "text-[var(--color-ivory)]",
      "md:py-24",
    );

    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass(
      "mt-10",
      "grid",
      "grid-cols-1",
      "gap-10",
      "md:mt-14",
      "md:grid-cols-2",
      "md:gap-16",
    );
  });

  it("labels the vision cell exactly Vision", () => {
    render(<WhoWeAreBand vision="A lasting studio." />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Vision" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A lasting studio.")).toBeInTheDocument();
  });

  it("skips empty fields and still renders filled cells", () => {
    render(
      <WhoWeAreBand
        mission="Make great games."
        vision=""
        motto="   "
        values={[]}
        cultureSummary=""
        teamIntro={undefined}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Mission" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Make great games.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Vision" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Motto" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Culture" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Team intro" })).not.toBeInTheDocument();
  });

  it("renders mission and values cells", () => {
    render(
      <WhoWeAreBand
        mission="Make great games."
        values={[
          { name: "Craft", description: "Polish every frame." },
          { name: "Care", description: "Respect the player." },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Mission" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Make great games.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Craft" })).toBeInTheDocument();
    expect(screen.getByText("Polish every frame.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Care" })).toBeInTheDocument();
    expect(screen.getByText("Respect the player.")).toBeInTheDocument();
  });

  it("returns null when all fields are empty", () => {
    const { container } = render(
      <WhoWeAreBand
        mission=""
        vision=""
        motto=""
        values={[]}
        cultureSummary=""
        teamIntro=""
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
