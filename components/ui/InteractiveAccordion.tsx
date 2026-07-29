"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";

export type InteractiveAccordionItem = {
  id: string;
  number: string;
  title: string;
  content: string;
};

export type InteractiveAccordionProps = {
  items: InteractiveAccordionItem[];
  defaultOpenId?: string | null;
  className?: string;
};

const spring = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.6 };

function resolveDefaultOpenId(
  items: InteractiveAccordionItem[],
  defaultOpenId?: string | null
): string | null {
  if (defaultOpenId === null) return null;
  if (typeof defaultOpenId === "string") return defaultOpenId;
  return items[0]?.id ?? null;
}

export function InteractiveAccordion({
  items,
  defaultOpenId,
  className,
}: InteractiveAccordionProps): React.JSX.Element {
  const uid = useId();
  const reducedMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(() =>
    resolveDefaultOpenId(items, defaultOpenId)
  );

  const transition = reducedMotion ? { duration: 0 } : spring;

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <div
      role="presentation"
      className={[
        "divide-y divide-[var(--border-default)]",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((item) => {
        const open = openId === item.id;
        const triggerId = `${uid}-trigger-${item.id}`;
        const panelId = `${uid}-panel-${item.id}`;

        return (
          <div key={item.id}>
            <h3 className="m-0">
              <button
                type="button"
                id={triggerId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={[
                  "group flex min-h-11 w-full items-start gap-3 px-0 py-4 text-left text-sm font-semibold transition-colors hover:text-sakura-ink md:text-base",
                  open ? "text-sakura-ink" : "text-[var(--text-primary)]",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "w-8 shrink-0 pt-0.5 tabular-nums md:w-10",
                    open ? "text-sakura-ink" : "text-[var(--text-muted)]",
                  ].join(" ")}
                >
                  {item.number}
                </span>
                <span className="relative min-w-0 flex-1 text-balance">
                  {item.title}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[var(--accent-primary)] transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
                  />
                </span>
                <span
                  aria-hidden="true"
                  className={[
                    "mt-0.5 shrink-0 text-lg text-sakura-ink transition-transform duration-300 motion-reduce:transition-none",
                    open ? "rotate-45" : "rotate-0",
                  ].join(" ")}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!open}
            >
              {/* R1: no AnimatePresence — body mounts only while open; height/opacity on wrapper */}
              <motion.div
                initial={false}
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                transition={transition}
                style={{ overflow: "hidden" }}
              >
                {open ? (
                  <p className="m-0 pb-4 pl-8 text-sm text-[var(--text-secondary)] md:pl-10 md:text-base">
                    {item.content}
                  </p>
                ) : null}
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
