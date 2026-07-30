import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDismiss = vi.fn();

const mockUseHeroScrollBounce = vi.fn(() => ({
  visible: true,
  dismiss: mockDismiss,
}));

vi.mock("@/hooks/useHeroScrollBounce", () => ({
  useHeroScrollBounce: (...args: unknown[]) => mockUseHeroScrollBounce(...args),
}));

import { HeroScrollHelper } from "./HeroScrollHelper";

describe("HeroScrollHelper", () => {
  beforeEach(() => {
    mockDismiss.mockClear();
    mockUseHeroScrollBounce.mockReturnValue({
      visible: true,
      dismiss: mockDismiss,
    });
  });

  it('renders "Scroll down" with accessible text', () => {
    render(<HeroScrollHelper />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Scroll down")).toBeInTheDocument();
  });

  it("dismiss button present; pointer dismiss calls dismiss once", async () => {
    const user = userEvent.setup();
    render(<HeroScrollHelper />);

    const dismissButton = screen.getByRole("button", {
      name: "Dismiss scroll tip",
    });
    expect(dismissButton).toBeInTheDocument();
    expect(dismissButton).toHaveClass("min-h-11", "min-w-11");

    await user.click(dismissButton);

    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismiss button handles pointerdown for reliable dismiss", () => {
    render(<HeroScrollHelper />);

    const dismissButton = screen.getByRole("button", {
      name: "Dismiss scroll tip",
    });

    dismissButton.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, cancelable: true }),
    );

    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("returns null when visible is false", () => {
    mockUseHeroScrollBounce.mockReturnValue({
      visible: false,
      dismiss: mockDismiss,
    });

    const { container } = render(<HeroScrollHelper />);

    expect(container).toBeEmptyDOMElement();
  });

  it("uses pointer-events isolation so tip does not steal header logo clicks", () => {
    const { container } = render(<HeroScrollHelper />);

    const status = screen.getByRole("status");
    expect(status).toHaveClass(
      "pointer-events-none",
      "absolute",
      "left-1/2",
      "top-24",
      "z-10",
      "-translate-x-1/2",
    );

    const balloon = container.querySelector(".rounded-2xl");
    expect(balloon).toHaveClass("pointer-events-auto");
  });

  it("applies sakura token classes and tip bounce motion", () => {
    const { container } = render(<HeroScrollHelper />);

    const balloon = container.querySelector(".rounded-2xl");
    expect(balloon).toHaveClass(
      "bg-[var(--color-sakura)]",
      "font-sans",
      "text-[var(--text-on-accent)]",
      "animate-bounce",
      "hover:animate-none",
      "focus-within:animate-none",
    );
  });

  it("passes bounce options to the hook", () => {
    render(<HeroScrollHelper />);

    expect(mockUseHeroScrollBounce).toHaveBeenCalledWith({
      threshold: 24,
      maxBounces: 1,
    });
  });

  // Read through useReducedMotion (subscription-based) rather than during render,
  // so the server and hydration passes agree on these classes.
  it("drops the animation classes when the user prefers reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as MediaQueryList);

    const { container } = render(<HeroScrollHelper />);

    const balloon = container.querySelector(".rounded-2xl");
    expect(balloon).not.toHaveClass("animate-bounce");
    expect(screen.getByRole("status").className).not.toContain("animate-[");

    vi.restoreAllMocks();
  });
});
