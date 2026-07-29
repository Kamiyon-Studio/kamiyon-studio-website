"use client";

import { Accordion as SkeletonAccordion } from "@skeletonlabs/skeleton-react";

type AccordionItem = {
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
};

/** Single-open accordion. First item starts expanded so content is visible without interaction. */
export function Accordion({ items }: AccordionProps) {
  const defaultValue = items.length > 0 ? ["item-0"] : [];

  return (
    <SkeletonAccordion
      defaultValue={defaultValue}
      collapsible
      className="divide-y divide-[var(--border-default)] rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)]"
    >
      {items.map((item, index) => {
        const value = `item-${index}`;

        return (
          <SkeletonAccordion.Item key={item.question} value={value}>
            <h3 className="m-0">
              <SkeletonAccordion.ItemTrigger className="flex min-h-11 w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)] transition-colors hover:text-sakura-ink focus-visible:outline-offset-2 md:text-base">
                <span>{item.question}</span>
                <SkeletonAccordion.ItemIndicator className="group shrink-0">
                  <span
                    aria-hidden="true"
                    className="block text-lg text-sakura-ink transition-transform motion-reduce:transition-none group-data-[state=open]:rotate-45"
                  >
                    +
                  </span>
                </SkeletonAccordion.ItemIndicator>
              </SkeletonAccordion.ItemTrigger>
            </h3>
            <SkeletonAccordion.ItemContent className="px-6 pb-4 text-sm text-[var(--text-secondary)] md:text-base">
              {item.answer}
            </SkeletonAccordion.ItemContent>
          </SkeletonAccordion.Item>
        );
      })}
    </SkeletonAccordion>
  );
}
