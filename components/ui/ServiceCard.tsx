import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import type { Service } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

import "./ServiceCard.css";

/** Shared placeholder until each service has its own CMS hero image. */
const SERVICE_CARD_PLACEHOLDER = "/assets/background.avif";

type ServiceCardProps = {
  service: Service;
  className?: string;
  /** Eager-load the first above-the-fold banner image for LCP. */
  priority?: boolean;
};

export function ServiceCard({ service, className, priority = false }: ServiceCardProps) {
  const description = service.tagline || service.summary;

  return (
    <Link
      href={`/services/${service.slug.current}`}
      className={cn("service-banner group", className)}
      aria-label={`${service.title} — view service`}
    >
      <div className="service-banner__media" aria-hidden="true">
        <Image
          src={SERVICE_CARD_PLACEHOLDER}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>

      <div className="service-banner__overlay">
        <div className="service-banner__copy">
          {service.isPlaceholder ? (
            <Badge variant="placeholder" className="mb-3 self-end">
              Placeholder
            </Badge>
          ) : null}

          <h2 className="service-banner__title">{service.title}</h2>

          {description ? (
            <p className="service-banner__description">{description}</p>
          ) : null}

          <span className="service-banner__cta" aria-hidden="true">
            View service
          </span>
        </div>
      </div>
    </Link>
  );
}
