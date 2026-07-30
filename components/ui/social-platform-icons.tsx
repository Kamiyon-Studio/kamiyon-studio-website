/**
 * Social platform icons — Font Awesome (fontawesome.com) is the site standard.
 * Brands use free-brands; email uses free-solid envelope.
 * itch.io MUST use the official brand glyph `faItchIo` / `fa-itch-io`.
 */

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faFacebook,
  faGithub,
  faInstagram,
  faItchIo,
  faLinkedin,
  faTiktok,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export type SocialPlatformIconName =
  | "facebook"
  | "linkedin"
  | "email"
  | "itch"
  | "youtube"
  | "x"
  | "instagram"
  | "tiktok"
  | "github";

export type SocialPlatformIconProps = {
  platform: SocialPlatformIconName;
  className?: string;
  /** Pixel size for width/height; defaults to 20. */
  size?: number;
};

/** Accessible labels for icon-only social links (aria-label lookup). */
export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatformIconName, string> = {
  facebook: "Facebook",
  linkedin: "LinkedIn",
  email: "Email",
  itch: "itch.io",
  youtube: "YouTube",
  x: "X",
  instagram: "Instagram",
  tiktok: "TikTok",
  github: "GitHub",
};

const PLATFORM_ICONS: Record<SocialPlatformIconName, IconDefinition> = {
  facebook: faFacebook,
  linkedin: faLinkedin,
  email: faEnvelope,
  itch: faItchIo,
  youtube: faYoutube,
  x: faXTwitter,
  instagram: faInstagram,
  tiktok: faTiktok,
  github: faGithub,
};

export function SocialPlatformIcon({
  platform,
  className = "",
  size = 20,
}: SocialPlatformIconProps) {
  return (
    <FontAwesomeIcon
      icon={PLATFORM_ICONS[platform]}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden
      focusable="false"
    />
  );
}
