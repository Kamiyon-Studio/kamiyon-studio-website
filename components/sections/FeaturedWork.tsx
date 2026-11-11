import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { TiltedCard } from "@/components/ui/TiltedCard";
import { marketingCardTiltProps } from "@/lib/ui/marketing-card-tilt";
import type { CaseStudy, HomeFeaturedWork, Product } from "@/lib/cms/types";

type FeaturedCard = {
  key: string;
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  isPlaceholder: boolean;
};

function toProductCards(products: Product[], slugs: string[]): FeaturedCard[] {
  const wantedSlugs = new Set(slugs);

  return products
    .filter((product) => wantedSlugs.has(product.slug.current))
    .map((product) => ({
      key: `product-${product.slug.current}`,
      href: `/products/${product.slug.current}`,
      eyebrow: product.genre,
      title: product.title,
      description: product.tagline,
      isPlaceholder: product.isPlaceholder,
    }));
}

function toCaseStudyCards(caseStudies: CaseStudy[], slugs: string[]): FeaturedCard[] {
  const wantedSlugs = new Set(slugs);

  return caseStudies
    .filter((caseStudy) => wantedSlugs.has(caseStudy.slug.current))
    .map((caseStudy) => ({
      key: `case-study-${caseStudy.slug.current}`,
      href: `/portfolio/${caseStudy.slug.current}`,
      eyebrow: caseStudy.industry,
      title: caseStudy.title,
      description: caseStudy.challenge,
      isPlaceholder: caseStudy.isPlaceholder,
    }));
}

type FeaturedWorkProps = {
  featuredWork: HomeFeaturedWork;
  products: Product[];
  caseStudies: CaseStudy[];
};

export function FeaturedWork({ featuredWork, products, caseStudies }: FeaturedWorkProps) {
  const cards = [
    ...toProductCards(products, featuredWork.featuredProductSlugs),
    ...toCaseStudyCards(caseStudies, featuredWork.featuredCaseStudySlugs),
  ];

  return (
    <section className="bg-[var(--bg-primary)] py-16 md:py-24">
      <Container>
        <div className="max-w-[680px]">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
            {featuredWork.title}
          </h2>
          <p className="mt-4 text-base text-[var(--text-secondary)] md:text-lg">
            {featuredWork.body}
          </p>
        </div>

        {cards.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <TiltedCard key={card.key} {...marketingCardTiltProps}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] focus-visible:outline-offset-2"
                >
                  {card.isPlaceholder ? (
                    <Badge variant="placeholder" className="mb-4 self-start">
                      Coming soon
                    </Badge>
                  ) : null}
                  <p className="text-sm font-medium uppercase tracking-wide text-sakura-ink">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-[var(--text-primary)]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{card.description}</p>
                  <span className="mt-4 text-sm font-medium text-sakura-ink transition-colors group-hover:opacity-80">
                    Learn more →
                  </span>
                </Link>
              </TiltedCard>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-[var(--text-muted)]">
            Featured work is coming soon.
          </p>
        )}
      </Container>
    </section>
  );
}
