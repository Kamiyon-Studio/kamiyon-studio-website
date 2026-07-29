import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RevealImageListItem, type ImageSource } from "./reveal-images";

const images: [ImageSource, ImageSource] = [
  { src: "/test-image-1.jpg", alt: "Test image 1" },
  { src: "/test-image-2.jpg", alt: "Test image 2" },
];

describe("RevealImageListItem", () => {
  it("renders the text", () => {
    render(<RevealImageListItem text="Game Development" images={images} />);

    expect(screen.getByText("Game Development")).toBeInTheDocument();
  });

  it("renders bold text (font-black class present)", () => {
    const { container } = render(
      <RevealImageListItem text="Game Development" images={images} />,
    );

    expect(container.querySelector(".font-black")).toBeInTheDocument();
  });

  it("renders both images with correct src when not decorative", () => {
    const { container } = render(
      <RevealImageListItem text="Game Development" images={images} />,
    );

    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(2);
    // DOM order: back (images[1]) then front (images[0])
    expect(imgs[0]).toHaveAttribute("src", "/test-image-2.jpg");
    expect(imgs[1]).toHaveAttribute("src", "/test-image-1.jpg");
    // Decorative alts — parent is aria-hidden
    expect(imgs[0]).toHaveAttribute("alt", "");
    expect(imgs[1]).toHaveAttribute("alt", "");
  });

  it("renders a link when href is provided", () => {
    render(
      <RevealImageListItem
        text="Game Development"
        images={images}
        href="/services/game-development"
      />,
    );

    const link = screen.getByRole("link", { name: "Game Development" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/services/game-development");
  });

  it("does not render a link when href is omitted", () => {
    render(<RevealImageListItem text="Game Development" images={images} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  describe("decorative mode", () => {
    it("renders no images when decorative is true", () => {
      const { container } = render(
        <RevealImageListItem
          text="Game Development"
          images={images}
          href="/services/game-development"
          decorative
        />,
      );

      expect(container.querySelectorAll("img")).toHaveLength(0);
    });

    it("renders no link when decorative is true even with href", () => {
      render(
        <RevealImageListItem
          text="Game Development"
          images={images}
          href="/services/game-development"
          decorative
        />,
      );

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("still renders the text in decorative mode", () => {
      render(
        <RevealImageListItem
          text="Game Development"
          images={images}
          decorative
        />,
      );

      expect(screen.getByText("Game Development")).toBeInTheDocument();
    });
  });

  it("applies extra className to the root element", () => {
    const { container } = render(
      <RevealImageListItem
        text="Game Development"
        images={images}
        className="custom-test-class"
      />,
    );

    expect(container.firstChild).toHaveClass("custom-test-class");
  });
});
