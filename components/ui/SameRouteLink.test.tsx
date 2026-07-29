import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { usePathnameMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(() => "/about"),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock("@/lib/motion/reduced-motion", () => ({
  prefersReducedMotion: () => false,
}));

import { SameRouteLink } from "./SameRouteLink";

describe("SameRouteLink", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/about");
  });

  it("smooth-scrolls to top on same-route clicks", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);

    render(<SameRouteLink href="/about">About</SameRouteLink>);

    await user.click(screen.getByRole("link", { name: "About" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("opens external contact form links in a new tab without same-route scroll", () => {
    const formUrl =
      "https://docs.google.com/forms/d/e/1FAIpQLSeIefAWJu5FP9pwljLFz1wSUxU2ybR3--GdylUYUBsGHH0yaw/viewform";

    render(<SameRouteLink href={formUrl}>Get in touch</SameRouteLink>);

    const link = screen.getByRole("link", { name: "Get in touch" });
    expect(link).toHaveAttribute("href", formUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("calls onNavigate after click", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    vi.stubGlobal("scrollTo", vi.fn());

    render(
      <SameRouteLink href="/about" onNavigate={onNavigate}>
        About
      </SameRouteLink>,
    );

    await user.click(screen.getByRole("link", { name: "About" }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("forwards tabIndex to the underlying link", () => {
    render(
      <SameRouteLink href="/about" tabIndex={-1}>
        About
      </SameRouteLink>,
    );

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "tabIndex",
      "-1",
    );
  });
});
