import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CONTACT_CTA } from "@/lib/config/navigation";

type CultureClosingProps = {
  cultureSummary: string;
};

export function CultureClosing({ cultureSummary }: CultureClosingProps) {
  return (
    <section className="bg-[var(--bg-accent)] py-16 md:py-24">
      <Container className="mx-auto max-w-[680px] text-center">
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          Our culture
        </h2>
        <p className="mt-4 text-base text-[var(--text-secondary)] md:text-lg">
          {cultureSummary}
        </p>

        <div className="mt-8">
          <Button href={CONTACT_CTA.href} variant="primary">
            {CONTACT_CTA.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
