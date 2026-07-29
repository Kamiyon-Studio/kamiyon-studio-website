import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";

type VisionBandProps = {
  vision: string;
};

/** Renders the canon Vision statement with an explicit label — never presented as current fact. */
export function VisionBand({ vision }: VisionBandProps) {
  return (
    <section className="bg-[var(--bg-accent)] py-16 md:py-20">
      <Container className="mx-auto max-w-[720px] text-center">
        <Badge variant="info">Vision — long-term aspiration</Badge>
        <p className="mt-6 font-display text-xl font-semibold text-[var(--text-primary)] md:text-2xl">
          {vision}
        </p>
      </Container>
    </section>
  );
}
