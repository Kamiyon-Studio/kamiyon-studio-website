import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/WordPullUp", () => ({
  WordPullUp: ({
    words,
    as: Tag = "h1",
    id,
    className,
  }: {
    words: string;
    as?: keyof HTMLElementTagNameMap;
    id?: string;
    className?: string;
  }) => (
    <Tag id={id} className={className}>
      {words}
    </Tag>
  ),
}));

vi.mock("@/components/animation/AnimatedSection", () => ({
  AnimatedSection: ({
    children,
    as: Tag = "div",
    className,
  }: {
    children: React.ReactNode;
    as?: keyof HTMLElementTagNameMap;
    className?: string;
  }) => <Tag className={className}>{children}</Tag>,
}));

import { ServicesStack, type ServiceStackSlide } from "./ServicesStack";

/** Gate 0 five-service taxonomy fixtures (ADR-016). */
const slides: ServiceStackSlide[] = [
  {
    id: "game-development",
    eyebrow: "Services",
    title: "Game Development",
    summary: "Build immersive games that inspire, educate, and entertain.",
    exploreHref: "/services/game-development",
  },
  {
    id: "product-development",
    eyebrow: "Services",
    title: "Product Development",
    summary: "Transform ideas into modern digital products.",
    exploreHref: "/services/product-development",
  },
  {
    id: "ui-design",
    eyebrow: "Services",
    title: "UI & Design",
    summary: "Design experiences people love to use.",
    exploreHref: "/services/ui-design",
  },
  {
    id: "branding",
    eyebrow: "Services",
    title: "Branding",
    summary: "Build memorable brands with purpose.",
    exploreHref: "/services/branding",
  },
  {
    id: "community-events",
    eyebrow: "Services",
    title: "Community & Events",
    summary: "Grow communities through meaningful experiences.",
    exploreHref: "/services/community-events",
  },
];

describe("ServicesStack", () => {
  it("renders nothing when slides is empty", () => {
    const { container } = render(<ServicesStack slides={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders section heading and all service cards", () => {
    render(<ServicesStack slides={slides} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "What we build" })
    ).toBeInTheDocument();

    slides.forEach((slide) => {
      expect(
        screen.getByRole("heading", { level: 3, name: slide.title })
      ).toBeInTheDocument();
      expect(screen.getByText(slide.summary)).toBeInTheDocument();
    });
  });

  it("renders an Explore link for each service", () => {
    render(<ServicesStack slides={slides} />);

    const exploreLinks = screen.getAllByRole("link", { name: "Explore" });
    expect(exploreLinks).toHaveLength(slides.length);
    exploreLinks.forEach((link, index) => {
      expect(link).toHaveAttribute("href", slides[index].exploreHref);
    });
  });

  it("uses ScrollStack window-scroll mode for page-flow stacking", () => {
    const { container } = render(<ServicesStack slides={slides} />);

    expect(
      container.querySelector(".scroll-stack-scroller--window")
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".scroll-stack-card")).toHaveLength(
      slides.length
    );
  });
});
