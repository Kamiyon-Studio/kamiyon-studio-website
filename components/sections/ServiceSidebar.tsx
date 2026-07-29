import { Button } from "@/components/ui/Button";
import type { Service } from "@/lib/cms/types";
import { CONTACT_CTA } from "@/lib/config/navigation";

type ServiceSidebarProps = {
  service: Service;
};

export function ServiceSidebar({ service }: ServiceSidebarProps) {
  return (
    <aside className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
      {service.capabilities.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Capabilities
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--text-primary)]">
            {service.capabilities.map((capability) => (
              <li key={capability} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-sakura-ink">
                  ✦
                </span>
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Button href={CONTACT_CTA.href} variant="primary" className="mt-6 w-full">
        Discuss this service
      </Button>
    </aside>
  );
}
