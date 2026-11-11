import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { marketingCardTiltProps } from "@/lib/ui/marketing-card-tilt";
import { getCmsImageUrl } from "@/lib/cms/image";
import { getDevelopmentStatusLabel } from "@/lib/products/development-status";
import type { Product } from "@/lib/cms/types";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const coverMedia = product.media[0];
  const coverImageUrl = getCmsImageUrl(coverMedia?.asset);

  return (
    <TiltedCard {...marketingCardTiltProps}>
      <Link
        href={`/products/${product.slug.current}`}
        className="group flex h-full min-h-min flex-col overflow-hidden rounded-[var(--radius-card-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] focus-visible:outline-offset-2"
      >
        <div className="relative aspect-[16/9] bg-[var(--bg-accent)]">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={coverMedia?.alt ?? product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
              <span className="text-4xl" aria-hidden="true">
                🌸
              </span>
              <span className="text-xs text-[var(--text-muted)]">Media coming soon</span>
            </div>
          )}
          <Badge variant="info" className="absolute left-4 top-4">
            {getDevelopmentStatusLabel(product.developmentStatus)}
          </Badge>
        </div>

        <div className="flex shrink-0 flex-1 flex-col p-6">
          <p className="text-sm font-medium uppercase tracking-wide text-sakura-ink">
            {product.genre}
          </p>
          <h3 className="mt-2 font-display text-lg font-semibold text-[var(--text-primary)]">
            {product.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">
            {product.tagline}
          </p>
          <span className="mt-4 text-sm font-medium text-sakura-ink transition-colors group-hover:opacity-80">
            Learn more →
          </span>
        </div>
      </Link>
    </TiltedCard>
  );
}
