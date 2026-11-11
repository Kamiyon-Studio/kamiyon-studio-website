import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TeamMember } from "@/lib/cms/types";
import { TeamMemberCard } from "./TeamMemberCard";

vi.mock("@/lib/cms/image", () => ({
  getCmsImageUrl: vi.fn(),
}));

const baseMember: TeamMember = {
  _type: "teamMember",
  name: "Jane Dela Cruz",
  role: "Founder",
  bio: "Bio coming soon.",
  socialLinks: [],
  order: 1,
  isPlaceholder: true,
};

describe("TeamMemberCard", () => {
  it("renders an initials avatar when no photo is set", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue(null);

    render(<TeamMemberCard member={baseMember} />);

    expect(screen.getByText("JC")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the resolved photo when a CMS image URL resolves", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue("/api/media/file/test.png");

    render(<TeamMemberCard member={baseMember} />);

    expect(screen.getByRole("img")).toHaveAttribute("alt", baseMember.name);
  });

  it("renders name, role, and bio", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue(null);

    render(<TeamMemberCard member={baseMember} />);

    expect(screen.getByText("Jane Dela Cruz")).toBeInTheDocument();
    expect(screen.getByText("Founder")).toBeInTheDocument();
    expect(screen.getByText("Bio coming soon.")).toBeInTheDocument();
  });

  it("shows a Placeholder badge only when isPlaceholder is true", async () => {
    const { getCmsImageUrl } = await import("@/lib/cms/image");
    vi.mocked(getCmsImageUrl).mockReturnValue(null);

    const { rerender } = render(<TeamMemberCard member={baseMember} />);
    expect(screen.getByText("Placeholder")).toBeInTheDocument();

    rerender(<TeamMemberCard member={{ ...baseMember, isPlaceholder: false }} />);
    expect(screen.queryByText("Placeholder")).not.toBeInTheDocument();
  });
});
