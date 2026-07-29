import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Service } from "@/lib/cms/types";
import { ServiceCard } from "./ServiceCard";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    fill: _fill,
    priority,
    sizes: _sizes,
    className,
    ...rest
  }: {
    alt: string;
    src: string;
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img
      alt={alt}
      src={src}
      className={className}
      data-priority={priority ? "true" : undefined}
      {...rest}
    />
  ),
}));

const baseService: Service = {
  _type: "service",
  title: "Game Development",
  slug: { current: "game-development" },
  tagline: "Build immersive games that inspire, educate, and entertain.",
  summary: "Full-cycle game development services.",
  body: [],
  capabilities: ["Full-cycle game development"],
  icon: "gamepad",
  order: 1,
  isPlaceholder: false,
  seo: { title: "", description: "" },
};

describe("ServiceCard", () => {
  it("links to the service detail route", () => {
    render(<ServiceCard service={baseService} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/services/game-development");
  });

  it("renders a full-bleed placeholder background image", () => {
    const { container } = render(<ServiceCard service={baseService} />);

    expect(container.querySelector('img[src="/assets/background.jpg"]')).toBeInTheDocument();
  });

  it("shows a Placeholder badge only when isPlaceholder is true", () => {
    const { rerender } = render(<ServiceCard service={baseService} />);

    expect(screen.queryByText("Placeholder")).not.toBeInTheDocument();

    rerender(<ServiceCard service={{ ...baseService, isPlaceholder: true }} />);

    expect(screen.getByText("Placeholder")).toBeInTheDocument();
  });

  it("prefers tagline over summary for card positioning copy", () => {
    render(<ServiceCard service={baseService} />);

    expect(screen.getByRole("heading", { name: "Game Development" })).toBeInTheDocument();
    expect(
      screen.getByText("Build immersive games that inspire, educate, and entertain."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Full-cycle game development services.")).not.toBeInTheDocument();
  });

  it("falls back to summary when tagline is empty", () => {
    render(<ServiceCard service={{ ...baseService, tagline: "" }} />);

    expect(screen.getByText("Full-cycle game development services.")).toBeInTheDocument();
  });

  it("exposes a view-service call to action via the link name", () => {
    render(<ServiceCard service={baseService} />);

    expect(
      screen.getByRole("link", { name: "Game Development — view service" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/view service/i)).toBeInTheDocument();
  });

  it("marks the first banner image as priority when requested", () => {
    const { container, rerender } = render(
      <ServiceCard service={baseService} priority />,
    );

    expect(container.querySelector("img")).toHaveAttribute("data-priority", "true");

    rerender(<ServiceCard service={baseService} />);

    expect(container.querySelector("img")).not.toHaveAttribute("data-priority");
  });
});
