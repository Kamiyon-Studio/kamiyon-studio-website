import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TeamMember } from "@/lib/cms/types";
import { TeamGrid } from "./TeamGrid";

vi.mock("@/lib/cms/image", () => ({
  getCmsImageUrl: vi.fn(() => null),
}));

vi.mock("@/components/ui/interactive-selector", () => ({
  InteractiveSelector: ({ members }: { members: TeamMember[] }) => (
    <div data-testid="interactive-selector">
      {members.map((member) => (
        <span key={member._id ?? member.name}>{member.name}</span>
      ))}
      {members.map((member) => (
        <span key={`${member._id ?? member.name}-role`}>{member.role}</span>
      ))}
    </div>
  ),
}));

const members: TeamMember[] = [
  {
    _type: "teamMember",
    name: "Jane Dela Cruz",
    role: "Founder",
    bio: "",
    socialLinks: [],
    order: 1,
    isPlaceholder: false,
  },
  {
    _type: "teamMember",
    name: "Sam Reyes",
    role: "Lead Designer",
    bio: "",
    socialLinks: [],
    order: 2,
    isPlaceholder: false,
  },
];

describe("TeamGrid", () => {
  it("renders InteractiveSelector with team members", () => {
    render(<TeamGrid teamMembers={members} />);

    expect(screen.getByTestId("interactive-selector")).toBeInTheDocument();
    expect(screen.getByText("Jane Dela Cruz")).toBeInTheDocument();
    expect(screen.getByText("Founder")).toBeInTheDocument();
    expect(screen.getByText("Sam Reyes")).toBeInTheDocument();
    expect(screen.getByText("Lead Designer")).toBeInTheDocument();
  });

  it("renders the team intro copy only when provided", () => {
    const { rerender } = render(<TeamGrid teamMembers={members} />);
    expect(screen.queryByText("A word from the team")).not.toBeInTheDocument();

    rerender(<TeamGrid teamMembers={members} teamIntro="A word from the team" />);
    expect(screen.getByText("A word from the team")).toBeInTheDocument();
  });

  it("sets the #team anchor id for in-page navigation", () => {
    const { container } = render(<TeamGrid teamMembers={members} />);

    expect(container.querySelector("#team")).not.toBeNull();
  });

  it("renders duplicate-name members with unique keys via _id", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const duplicateNames: TeamMember[] = [
      {
        _type: "teamMember",
        _id: "member-a",
        name: "Sherwin Limosnero",
        role: "CEO",
        bio: "",
        socialLinks: [],
        order: 1,
        isPlaceholder: false,
      },
      {
        _type: "teamMember",
        _id: "member-b",
        name: "Sherwin Limosnero",
        role: "CEO",
        bio: "",
        socialLinks: [],
        order: 2,
        isPlaceholder: false,
      },
    ];

    render(<TeamGrid teamMembers={duplicateNames} />);

    expect(screen.getAllByText("Sherwin Limosnero")).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining("same key"),
      expect.anything(),
      expect.anything(),
    );
    consoleError.mockRestore();
  });
});
