import { Container } from "@/components/ui/Container";
import { ServiceCard } from "@/components/ui/ServiceCard";
import type { Service } from "@/lib/cms/types";

type ServicesListingProps = {
  services: Service[];
};

/** Flat Gate 0 listing — five service banners in a padded content column. */
export function ServicesListing({ services }: ServicesListingProps) {
  const ordered = [...services].sort((a, b) => a.order - b.order);

  return (
    <section
      className="bg-[var(--bg-primary)] pb-16 pt-8 md:pb-24 md:pt-10"
      aria-label="Service offerings"
    >
      <Container>
        <div className="mx-auto flex max-w-5xl flex-col gap-5 md:gap-6">
          {ordered.map((service, index) => (
            <ServiceCard
              key={service.slug.current}
              service={service}
              priority={index === 0}
              className="rounded-[var(--radius-card)] shadow-[var(--shadow-sm)]"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
