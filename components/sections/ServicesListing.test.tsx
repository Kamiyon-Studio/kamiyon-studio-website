import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Service } from "@/lib/cms/types";
import { ServicesListing } from "./ServicesListing";

vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    fill: _fill,
    priority: _priority,
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
    <img alt={alt} src={src} className={className} {...rest} />
  ),
}));

function makeService(overrides: Partial<Service> & Pick<Service, "title" | "order">): Service {
  const slug =
    overrides.slug?.current ??
    overrides.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    _type: "service",
    slug: { current: slug },
    tagline: overrides.tagline ?? `${overrides.title} tagline`,
    summary: overrides.summary ?? `${overrides.title} summary`,
    body: [],
    capabilities: overrides.capabilities ?? [],
    isPlaceholder: false,
    seo: { title: "", description: "" },
    ...overrides,
  };
}

const fiveServices: Service[] = [
  makeService({
    title: "Community & Events",
    slug: { current: "community-events" },
    tagline: "Grow communities through meaningful experiences.",
    order: 5,
  }),
  makeService({
    title: "Branding",
    slug: { current: "branding" },
    tagline: "Build memorable brands with purpose.",
    order: 4,
  }),
  makeService({
    title: "UI & Design",
    slug: { current: "ui-design" },
    tagline: "Design experiences people love to use.",
    order: 3,
  }),
  makeService({
    title: "Product Development",
    slug: { current: "product-development" },
    tagline: "Transform ideas into modern digital products.",
    order: 2,
  }),
  makeService({
    title: "Game Development",
    slug: { current: "game-development" },
    tagline: "Build immersive games that inspire, educate, and entertain.",
    order: 1,
  }),
];

describe("ServicesListing", () => {
  it("renders a flat ordered list with Game Development first", () => {
    render(<ServicesListing services={fiveServices} />);

    expect(screen.getByRole("region", { name: "Service offerings" })).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/services/game-development",
      "/services/product-development",
      "/services/ui-design",
      "/services/branding",
      "/services/community-events",
    ]);
  });

  it("does not render obsolete category groupings or old offering names", () => {
    render(<ServicesListing services={fiveServices} />);

    expect(screen.queryByText(/software development/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/interactive experience development/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/consulting & technical advisory/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/industries we work with/i)).not.toBeInTheDocument();
  });

  it("surfaces Gate 0 taglines on each banner card", () => {
    render(<ServicesListing services={fiveServices} />);

    for (const service of fiveServices) {
      const link = screen.getByRole("link", { name: new RegExp(service.title, "i") });
      expect(within(link).getByText(service.tagline)).toBeInTheDocument();
      expect(within(link).getByRole("heading", { level: 2, name: service.title })).toBeInTheDocument();
    }
  });
});
