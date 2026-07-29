import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TeamMember } from "@/lib/cms/types";
import { InteractiveSelector } from "./interactive-selector";

vi.mock("@/lib/cms/image", () => ({
  getCmsImageUrl: vi.fn(() => null),
}));

beforeEach(async () => {
  const { getCmsImageUrl } = await import("@/lib/cms/image");
  vi.mocked(getCmsImageUrl).mockReturnValue(null);
});

vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: {
    alt: string;
    src?: string;
    fill?: boolean;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    <img alt={alt} src={props.src} className={props.className} />
  ),
}));

const members: TeamMember[] = [
  {
    _type: "teamMember",
    _id: "m1",
    name: "Jane Dela Cruz",
    role: "Founder",
    bio: "Hidden bio should not appear.",
    socialLinks: [
      { platform: "linkedin", url: "https://linkedin.com/in/jane", label: "LinkedIn" },
      { platform: "x", url: "https://x.com/jane", label: "X" },
    ],
    order: 1,
    isPlaceholder: false,
  },
  {
    _type: "teamMember",
    _id: "m2",
    name: "Sam Reyes",
    role: "Lead Designer",
    bio: "Also hidden.",
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/sam", label: "Instagram" },
    ],
    order: 2,
    isPlaceholder: false,
  },
];

describe("InteractiveSelector", () => {
  it("shows name, role, and socials for the default active member only", () => {
    render(<InteractiveSelector members={members} />);

    expect(screen.getByText("Jane Dela Cruz")).toBeInTheDocument();
    expect(screen.getByText("Founder")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/jane",
    );
    expect(screen.getByRole("link", { name: "X" })).toHaveAttribute(
      "href",
      "https://x.com/jane",
    );

    expect(screen.queryByText("Sam Reyes")).not.toBeInTheDocument();
    expect(screen.queryByText("Lead Designer")).not.toBeInTheDocument();
    expect(screen.queryByText("Hidden bio should not appear.")).not.toBeInTheDocument();
  });

  it("expands a clicked member and hides the previous overlay", async () => {
    render(<InteractiveSelector members={members} />);

    fireEvent.click(
      screen.getByRole("tab", { name: "Sam Reyes, Lead Designer" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Sam Reyes")).toBeInTheDocument();
    });
    expect(screen.getByText("Lead Designer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Jane Dela Cruz")).not.toBeInTheDocument();
    });
  });

  it("keeps portraits desaturated until hovered or active", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue("/api/media/file/portrait.png");

    const { container } = render(<InteractiveSelector members={members} />);

    const options = container.querySelectorAll("[data-team-option]");
    expect(options.length).toBe(2);

    // Inactive option stays grayscale
    expect(options[1]?.className).toMatch(/grayscale/);

    // Active option is full color
    expect(options[0]?.className).toMatch(/grayscale-0/);

    fireEvent.mouseEnter(options[1]!);
    await waitFor(() => {
      expect(options[1]?.className).toMatch(/grayscale-0/);
    });
  });

  it("falls back to photo-area initials when no photo resolves, without circular icon badges", () => {
    const { container } = render(<InteractiveSelector members={members} />);

    expect(screen.getAllByText("JC")).toHaveLength(1);
    expect(screen.getAllByText("SR")).toHaveLength(1);
    expect(container.querySelector(".icon")).toBeNull();
    expect(container.querySelector(".rounded-full.size-11")).toBeNull();
  });

  it("uses primary border on every option including the active one", () => {
    const { container } = render(<InteractiveSelector members={members} />);

    const options = container.querySelectorAll("[data-team-option]");
    expect(options.length).toBe(2);
    for (const option of options) {
      expect(option.className).toContain("border-[var(--color-primary)]");
    }
  });

  it("advances and wraps selection with Prev/Next controls", async () => {
    render(<InteractiveSelector members={members} />);

    const next = screen.getByRole("button", { name: "Next team member" });
    const prev = screen.getByRole("button", { name: "Previous team member" });

    fireEvent.click(next);
    await waitFor(() => {
      expect(screen.getByText("Sam Reyes")).toBeInTheDocument();
    });
    expect(screen.queryByText("Jane Dela Cruz")).not.toBeInTheDocument();

    fireEvent.click(next);
    await waitFor(() => {
      expect(screen.getByText("Jane Dela Cruz")).toBeInTheDocument();
    });

    fireEvent.click(prev);
    await waitFor(() => {
      expect(screen.getByText("Sam Reyes")).toBeInTheDocument();
    });
  });

  it("hides Prev/Next when fewer than two members", () => {
    render(<InteractiveSelector members={[members[0]!]} />);

    expect(
      screen.queryByRole("button", { name: "Previous team member" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next team member" }),
    ).not.toBeInTheDocument();
  });

  it("moves selection with arrow keys on the tablist", async () => {
    const user = userEvent.setup();
    render(<InteractiveSelector members={members} />);

    const janeTab = screen.getByRole("tab", {
      name: "Jane Dela Cruz, Founder",
    });
    janeTab.focus();
    await user.keyboard("{ArrowRight}");

    await waitFor(() => {
      expect(screen.getByText("Sam Reyes")).toBeInTheDocument();
    });
  });

  it("returns null when members is empty", () => {
    const { container } = render(<InteractiveSelector members={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
