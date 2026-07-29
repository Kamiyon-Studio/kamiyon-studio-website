import {
  InteractiveAccordion,
  type InteractiveAccordionItem,
} from "@/components/ui/InteractiveAccordion";
import { Container } from "@/components/ui/Container";
import type { FaqItem } from "@/lib/cms/types";

type ContactFAQProps = {
  faq: FaqItem[];
};

function toAccordionItems(faq: FaqItem[]): InteractiveAccordionItem[] {
  return faq.map((item, index) => ({
    id: `faq-${index}`,
    number: String(index + 1).padStart(2, "0"),
    title: item.question,
    content: item.answer,
  }));
}

export function ContactFAQ({ faq }: ContactFAQProps) {
  if (faq.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="bg-[var(--bg-secondary)] py-16 md:py-24">
      <Container className="mx-auto max-w-[720px]">
        <h2 className="text-center font-display text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          Frequently asked questions
        </h2>
        <div className="mt-8">
          <InteractiveAccordion items={toAccordionItems(faq)} />
        </div>
      </Container>
    </section>
  );
}
