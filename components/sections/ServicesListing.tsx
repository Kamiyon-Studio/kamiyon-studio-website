import { Container } from "@/components/ui/Container";
import { ServiceCard } from "@/components/ui/ServiceCard";
import type { Service } from "@/lib/cms/types";

type ServicesListingProps = {
  services: Service[];
};

/** Flat Gate 0 listing — five services ordered by `order`, no category groups. */
export function ServicesListing({ services }: ServicesListingProps) {
  const ordered = [...services].sort((a, b) => a.order - b.order);

  return (
    <section className="bg-[var(--bg-primary)] py-16 md:py-24">
      <Container>
        <div className="max-w-[680px]">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            Services
          </h1>
          <p className="mt-4 text-base text-[var(--text-secondary)] md:text-lg">
            A creative technology studio — games first. Five offerings spanning
            immersive games, digital products, design, branding, and community.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((service) => (
            <ServiceCard key={service.slug.current} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
