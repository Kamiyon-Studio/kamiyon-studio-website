import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  SocialPlatformIcon,
  SOCIAL_PLATFORM_LABELS,
  type SocialPlatformIconName,
} from "@/components/ui/social-platform-icons";

const PLATFORMS = Object.keys(SOCIAL_PLATFORM_LABELS) as SocialPlatformIconName[];

/** Expected Font Awesome `data-icon` values (official FA icon names). */
const FA_DATA_ICON: Record<SocialPlatformIconName, string> = {
  facebook: "facebook",
  linkedin: "linkedin",
  email: "envelope",
  itch: "itch-io",
  youtube: "youtube",
  x: "x-twitter",
  instagram: "instagram",
  tiktok: "tiktok",
  github: "github",
};

describe("SocialPlatformIcon", () => {
  it.each(PLATFORMS)("renders Font Awesome icon for %s", (platform) => {
    const { container } = render(<SocialPlatformIcon platform={platform} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("data-icon", FA_DATA_ICON[platform]);
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("uses the official Font Awesome itch.io brand icon (fa-itch-io)", () => {
    const { container } = render(<SocialPlatformIcon platform="itch" size={24} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("data-icon", "itch-io");
    expect(svg).toHaveAttribute("data-prefix", "fab");
    expect(svg).toHaveStyle({ width: "24px", height: "24px" });
  });
});
