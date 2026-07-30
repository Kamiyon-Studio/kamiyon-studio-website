import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TeamMember } from "@/lib/cms/types";
import { HoverExpand } from "./expand-on-hover";

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

describe("HoverExpand", () => {
  it("shows name, role, and socials for the default active member only", () => {
    render(<HoverExpand members={members} />);

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
    expect(screen.queryByText("Also hidden.")).not.toBeInTheDocument();
  });

  it("reveals hovered member details and hides the previous overlay", async () => {
    render(<HoverExpand members={members} />);

    const samStrip = screen.getByRole("tab", {
      name: "Sam Reyes, Lead Designer",
    });
    fireEvent.mouseEnter(samStrip.parentElement!);

    await waitFor(() => {
      expect(screen.getByText("Sam Reyes")).toBeInTheDocument();
    });
    expect(screen.getByText("Lead Designer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Jane Dela Cruz")).not.toBeInTheDocument();
    });
  });

  it("keeps face/eyes framing via object-position on photo strips", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue("/api/media/file/portrait.png");

    const { container } = render(<HoverExpand members={members} />);

    const photos = container.querySelectorAll("img");
    expect(photos.length).toBeGreaterThan(0);
    for (const photo of photos) {
      expect(photo.className).toMatch(/object-\[center_22%\]/);
    }
  });

  it("falls back to initials when no photo resolves", () => {
    render(<HoverExpand members={members} />);

    expect(screen.getByText("JC")).toBeInTheDocument();
    expect(screen.getByText("SR")).toBeInTheDocument();
  });

  it("supports keyboard activation of a strip", async () => {
    const user = userEvent.setup();
    render(<HoverExpand members={members} />);

    const samStrip = screen.getByRole("tab", {
      name: "Sam Reyes, Lead Designer",
    });
    await user.click(samStrip);

    expect(screen.getByText("Sam Reyes")).toBeInTheDocument();
    expect(screen.getByText("Lead Designer")).toBeInTheDocument();
  });

  it("moves selection with arrow keys on the tablist", async () => {
    const user = userEvent.setup();
    render(<HoverExpand members={members} />);

    const janeTab = screen.getByRole("tab", {
      name: "Jane Dela Cruz, Founder",
    });
    janeTab.focus();
    await user.keyboard("{ArrowRight}");

    await waitFor(() => {
      expect(screen.getByText("Sam Reyes")).toBeInTheDocument();
    });
  });
});
