import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { homePageFallback } from "@/lib/cms/fallbacks/home";

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

import { HomeContact } from "./HomeContact";

const ctaBanner = homePageFallback.blocks.find((block) => block._type === "ctaBanner");

if (!ctaBanner || ctaBanner._type !== "ctaBanner") {
  throw new Error("Expected homePageFallback to include a ctaBanner block");
}

const defaultProps = {
  heading: ctaBanner.title,
  body: ctaBanner.body,
  ctaLabel: ctaBanner.ctaLabel,
  ctaHref: ctaBanner.ctaHref,
};

describe("HomeContact", () => {
  it("renders the heading, body, and ghost CTA link", () => {
    render(<HomeContact {...defaultProps} />);

    expect(screen.getByRole("heading", { name: defaultProps.heading })).toBeInTheDocument();
    expect(screen.getByText(defaultProps.body)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: defaultProps.ctaLabel })).toHaveAttribute(
      "href",
      defaultProps.ctaHref,
    );
    expect(defaultProps.ctaHref).toContain("docs.google.com/forms");
  });

  it("does not render a contact form or input fields", () => {
    render(<HomeContact {...defaultProps} />);

    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /submit/i })).not.toBeInTheDocument();
  });

  it("renders the default atmospheric visual as a section background", () => {
    const { container } = render(<HomeContact {...defaultProps} />);

    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toContain("background.jpg");
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("renders a custom atmospheric visual when visualSrc is provided", () => {
    const { container } = render(
      <HomeContact {...defaultProps} visualSrc="/assets/youtube-banner.png" />
    );

    expect(container.querySelector("img")?.getAttribute("src")).toContain("youtube-banner.png");
  });

  it("exposes an accessible section landmark with dark nav theme", () => {
    render(<HomeContact {...defaultProps} />);

    const region = screen.getByRole("region", { name: defaultProps.heading });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("data-nav-theme", "dark");
  });

  it("renders a decorative hexagonal mail icon instead of the sakura emoji", () => {
    const { container } = render(<HomeContact {...defaultProps} />);

    const icon = screen.getByTestId("home-contact-mail-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon.querySelector("svg")).toBeInTheDocument();
    expect(container.textContent).not.toContain("🌸");
  });
});
