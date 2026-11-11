import { Container } from "@/components/ui/Container";
import { ServiceCard } from "@/components/ui/ServiceCard";
import type { Service } from "@/lib/cms/types";

type ServicesListingProps = {
  services: Service[];
};

/** Flat Gate 0 listing — service offerings in a readable content column. */
export function ServicesListing({ services }: ServicesListingProps) {
  const ordered = [...services].sort((a, b) => a.order - b.order);

  return (
    <section
      className="bg-[var(--bg-primary)] pb-16 pt-8 md:pb-24 md:pt-10"
      aria-label="Service offerings"
    >
      <Container>
        <div className="flex flex-col">
          {ordered.map((service) => (
            <ServiceCard
              key={service.slug.current}
              service={service}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
