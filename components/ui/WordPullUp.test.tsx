import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@gsap/react", () => ({
  useGSAP: () => undefined,
}));

vi.mock("@/lib/gsap", () => ({
  gsap: { set: vi.fn(), to: vi.fn(() => ({ play: vi.fn() })) },
  ScrollTrigger: { create: vi.fn() },
}));

vi.mock("@/lib/motion/reduced-motion", () => ({
  prefersReducedMotion: () => true,
}));

import { WordPullUp } from "./WordPullUp";

describe("WordPullUp", () => {
  it("renders each word from the heading string", () => {
    render(
      <WordPullUp
        as="h2"
        words="Recent Projects"
        className="mt-3"
      />,
    );

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Recent Projects",
    });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("mt-3");
  });

  it("applies the cinematic display heading treatment by default", () => {
    render(<WordPullUp as="h2" words="Recent Projects" />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("footer-text-glow");
    expect(heading).toHaveClass("font-display");
    expect(heading).toHaveClass("text-5xl");
    expect(heading).toHaveClass("font-black");
    expect(heading).toHaveClass("tracking-tighter");
    expect(heading).toHaveClass("md:text-8xl");
  });

  it("forwards id for aria-labelledby targets", () => {
    render(<WordPullUp as="h2" id="section-heading" words="What we build" />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
      "id",
      "section-heading",
    );
  });

  it("preserves word spacing in heading text", () => {
    render(<WordPullUp as="h1" words="Create  Play" startOnView={false} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toMatch(/Create\s+Play/);
  });

  // `prefersReducedMotion` is mocked to true above, so this asserts the markup
  // does not branch on it. Branching during render made the server and client
  // trees disagree and React discarded the whole homepage tree on hydration.
  it("renders the same word spans regardless of motion preference", () => {
    const { container } = render(
      <WordPullUp as="h2" words="Recent Projects" startOnView={false} />,
    );

    const wordSpans = container.querySelectorAll(".word-pull-up-word");
    expect(wordSpans).toHaveLength(2);
    expect(wordSpans[0]?.textContent).toBe("Recent");
    expect(wordSpans[1]?.textContent).toBe("Projects");
  });

  // Accessible-name computation trims each element's own text, so a separator
  // kept inside a word span is dropped and the heading announces as "RecentProjects".
  it("keeps word separators outside the spans so the name is not run together", () => {
    render(<WordPullUp as="h2" words="Meet the team" startOnView={false} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Meet the team" }),
    ).toBeInTheDocument();
  });
});
