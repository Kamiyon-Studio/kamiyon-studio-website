import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Award } from "@/lib/cms/types";
import { RecognitionAwards } from "./RecognitionAwards";

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

vi.mock("@/components/animation/AnimatedSection", () => ({
  AnimatedSection: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

function makeAward(overrides: Partial<Award> & Pick<Award, "id">): Award {
  return {
    _type: "award",
    title: "Gameplay Design Award",
    label: "Winner",
    organization: "Montreal Independent Games Festival",
    year: "2026",
    order: 1,
    isPlaceholder: false,
    ...overrides,
  };
}

describe("RecognitionAwards", () => {
  it("renders a laurel badge per award with heading and anchor", () => {
    const { container } = render(
      <RecognitionAwards
        awards={[
          makeAward({ id: "a", title: "Gameplay Design Award" }),
          makeAward({ id: "b", title: "Best Student Game", order: 2 }),
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Awards" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Recognition")).toBeInTheDocument();
    expect(container.querySelector("#home-recognition")).not.toBeNull();

    const items = within(screen.getByTestId("recognition-grid")).getAllByRole(
      "listitem",
    );
    expect(items).toHaveLength(2);
    expect(screen.getByText("Gameplay Design Award")).toBeInTheDocument();
    expect(screen.getByText("Best Student Game")).toBeInTheDocument();
  });

  it("orders badges by the CMS order field, not array position", () => {
    render(
      <RecognitionAwards
        awards={[
          makeAward({ id: "third", title: "Third", order: 3 }),
          makeAward({ id: "first", title: "First", order: 1 }),
          makeAward({ id: "second", title: "Second", order: 2 }),
        ]}
      />,
    );

    const titles = within(screen.getByTestId("recognition-grid"))
      .getAllByRole("listitem")
      .map((item) => item.textContent);

    expect(titles[0]).toContain("First");
    expect(titles[1]).toContain("Second");
    expect(titles[2]).toContain("Third");
  });

  it("renders nothing when there are no awards", () => {
    const { container } = render(<RecognitionAwards awards={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("caps the grid at two columns until there are at least three awards", () => {
    const { rerender, container } = render(
      <RecognitionAwards awards={[makeAward({ id: "a" })]} />,
    );
    expect(container.querySelector("[data-testid='recognition-grid']")).toHaveClass(
      "grid-cols-1",
    );

    rerender(
      <RecognitionAwards
        awards={[makeAward({ id: "a" }), makeAward({ id: "b", order: 2 })]}
      />,
    );
    expect(container.querySelector("[data-testid='recognition-grid']")).toHaveClass(
      "sm:grid-cols-2",
    );

    rerender(
      <RecognitionAwards
        awards={[
          makeAward({ id: "a" }),
          makeAward({ id: "b", order: 2 }),
          makeAward({ id: "c", order: 3 }),
        ]}
      />,
    );
    expect(container.querySelector("[data-testid='recognition-grid']")).toHaveClass(
      "lg:grid-cols-3",
    );
  });

  it("marks placeholder slots so they never read as real accolades", () => {
    render(
      <RecognitionAwards
        awards={[makeAward({ id: "slot", title: "Award slot", isPlaceholder: true })]}
      />,
    );

    expect(screen.getByText("Placeholder")).toBeInTheDocument();
  });

  it("accepts custom eyebrow, heading, and summary copy", () => {
    render(
      <RecognitionAwards
        awards={[makeAward({ id: "a" })]}
        eyebrow="Accolades"
        heading="Recognition"
        summary="Where our work has been recognised."
      />,
    );

    expect(screen.getByText("Accolades")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Recognition" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Where our work has been recognised."),
    ).toBeInTheDocument();
  });
});
