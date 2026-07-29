"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
  type JSX,
  type KeyboardEvent,
} from "react";

import type { TimelineImage } from "@/lib/timeline";
import { cn } from "@/lib/utils";

export type TimelineEntryMediaProps = {
  images: TimelineImage[];
  entryKey: string;
  className?: string;
};

export function TimelineEntryMedia({
  images,
  entryKey,
  className,
}: TimelineEntryMediaProps): JSX.Element | null {
  if (images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    const image = images[0]!;
    return (
      <div
        className={cn("timeline-entry-frame", className)}
        data-testid={`timeline-media-${entryKey}`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 28rem"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <TimelineEntryCarousel
      images={images}
      entryKey={entryKey}
      className={className}
    />
  );
}

function TimelineEntryCarousel({
  images,
  entryKey,
  className,
}: TimelineEntryMediaProps): JSX.Element {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    const sync = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    // Subscribe first; defer initial sync off the effect body for the lint rule.
    emblaApi.on("select", sync);
    emblaApi.on("reInit", sync);
    const frame = requestAnimationFrame(sync);
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", sync);
      emblaApi.off("reInit", sync);
    };
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  const handleDotKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollTo(Math.max(0, index - 1));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollTo(Math.min(images.length - 1, index + 1));
    }
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Timeline entry images"
      className={cn("timeline-entry-frame", className)}
      data-testid={`timeline-media-${entryKey}`}
    >
      <div ref={emblaRef} className="timeline-embla-viewport h-full w-full overflow-hidden">
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={`${entryKey}-img-${index}`}
              className="relative min-w-0 shrink-0 grow-0 basis-full"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 28rem"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <p
          className="rounded bg-[var(--color-charcoal)]/70 px-2 py-1 font-display text-xs tracking-wide text-[var(--color-ivory)]"
          data-testid={`timeline-media-counter-${entryKey}`}
          aria-live="polite"
        >
          {selectedIndex + 1}/{images.length}
        </p>
        <div className="pointer-events-auto flex gap-1.5" role="group" aria-label="Carousel slides">
          {images.map((_, index) => (
            <button
              key={`${entryKey}-dot-${index}`}
              type="button"
              className={cn(
                "h-2.5 min-h-11 min-w-11 rounded-full px-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sakura)]",
                "flex items-center justify-center",
              )}
              aria-label={`Show image ${index + 1}`}
              aria-current={selectedIndex === index ? "true" : undefined}
              onClick={() => scrollTo(index)}
              onKeyDown={(event) => handleDotKeyDown(event, index)}
            >
              <span
                className={cn(
                  "block h-2.5 w-2.5 rounded-full",
                  selectedIndex === index
                    ? "bg-[var(--color-sakura)]"
                    : "bg-[var(--color-ivory)]/40",
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
