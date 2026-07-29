import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TeamMember } from "@/lib/cms/types";
import { mapTeamMembersToFocusRailItems, TeamGrid } from "./TeamGrid";

vi.mock("@/lib/cms/image", () => ({
  getCmsImageUrl: vi.fn((image?: { url?: string } | null) =>
    image?.url ? image.url : null,
  ),
}));

vi.mock("@/components/ui/focus-rail", () => ({
  FocusRail: ({
    items,
  }: {
    items: Array<{ id: string | number; title: string; meta?: string }>;
  }) => (
    <div data-testid="focus-rail">
      {items.map((item) => (
        <span key={item.id}>
          {item.title}
          {item.meta ? ` · ${item.meta}` : ""}
        </span>
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
    bio: "Designs product systems.",
    socialLinks: [
      {
        platform: "linkedin",
        url: "https://linkedin.com/in/sam",
        label: "LinkedIn",
      },
    ],
    order: 2,
    isPlaceholder: false,
  },
];

describe("TeamGrid", () => {
  it("renders FocusRail with team members", () => {
    render(<TeamGrid teamMembers={members} />);

    expect(screen.getByTestId("focus-rail")).toBeInTheDocument();
    expect(screen.getByText(/Jane Dela Cruz/)).toBeInTheDocument();
    expect(screen.getByText(/Founder/)).toBeInTheDocument();
    expect(screen.getByText(/Sam Reyes/)).toBeInTheDocument();
    expect(screen.getByText(/Lead Designer/)).toBeInTheDocument();
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

    expect(screen.getAllByText(/Sherwin Limosnero/)).toHaveLength(2);
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining("same key"),
      expect.anything(),
      expect.anything(),
    );
    consoleError.mockRestore();
  });
});

describe("mapTeamMembersToFocusRailItems", () => {
  it("maps name/role/bio and skips placeholder bios", () => {
    const items = mapTeamMembersToFocusRailItems([
      {
        _type: "teamMember",
        _id: "a",
        name: "Ada",
        role: "CEO",
        bio: "Bio coming soon.",
        socialLinks: [],
        order: 1,
        isPlaceholder: true,
      },
      {
        _type: "teamMember",
        _id: "b",
        name: "Sam",
        role: "CTO",
        bio: "Builds platforms.",
        photo: {
          url: "https://media.kamiyonstudio.com/team/sam.jpg",
          alt: "Sam",
        },
        socialLinks: [{ platform: "x", url: "https://x.com/sam", label: "X" }],
        order: 2,
        isPlaceholder: false,
      },
    ]);

    expect(items[0]).toMatchObject({
      id: "a",
      title: "Ada",
      meta: "CEO",
    });
    expect(items[0]?.description).toBeUndefined();
    expect(items[0]?.imageSrc).toContain("images.unsplash.com");

    expect(items[1]).toMatchObject({
      id: "b",
      title: "Sam",
      meta: "CTO",
      description: "Builds platforms.",
      imageSrc: "https://media.kamiyonstudio.com/team/sam.jpg",
      href: "https://x.com/sam",
    });
  });
});
