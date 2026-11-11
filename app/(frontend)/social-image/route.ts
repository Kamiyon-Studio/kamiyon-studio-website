import { renderDefaultOgImage } from "@/lib/seo/og-image";

export const dynamic = "force-static";

export function GET() {
  return renderDefaultOgImage();
}
