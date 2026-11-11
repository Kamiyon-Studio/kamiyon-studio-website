import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Service } from "@/lib/cms/types";
import { cn } from "@/lib/utils";
import "./ServiceCard.css";

type ServiceCardProps = {
  service: Service;
  className?: string;
};

export function ServiceCard({ service, className }: ServiceCardProps) {
  const description = service.tagline || service.summary;
  return (
    <Link
      href={`/services/${service.slug.current}`}
      className={cn("service-banner group", className)}
      aria-label={`${service.title} — view service`}
    >
      <div>
        {service.isPlaceholder ? <Badge variant="placeholder" className="mb-3">Placeholder</Badge> : null}
        <h2 className="service-banner__title">{service.title}</h2>
      </div>
      <div className="service-banner__copy">
        {description ? <p className="service-banner__description">{description}</p> : null}
        {service.capabilities.length > 0 ? (
          <ul className="service-banner__capabilities" aria-label="Capabilities">
            {service.capabilities.slice(0, 3).map((capability) => <li key={capability}>{capability}</li>)}
          </ul>
        ) : null}
        <span className="service-banner__cta" aria-hidden="true">
          View service
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M5 19 19 5M5 5h14v14" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
