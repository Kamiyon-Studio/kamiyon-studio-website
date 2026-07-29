"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { TextRoll } from "@/components/ui/text-roll";
import { isAllowedNextImageSrc } from "@/lib/cms/image";
import { cn } from "@/lib/utils";

export type LogoItem = {
  src?: string | null;
  alt?: string | null;
  label?: string | null;
};

type ItemGap = "sm" | "md" | "lg";

type AnimatedCarouselProps = {
  title?: string;
  logoCount?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  logos?: Array<string | LogoItem> | null;
  containerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  carouselClassName?: string;
  logoClassName?: string;
  itemsPerViewMobile?: 2 | 3 | 4 | 5;
  itemsPerViewDesktop?: 3 | 4 | 5 | 6;
  itemGap?: ItemGap;
  spacing?: string;
  padding?: string;
  logoContainerWidth?: string;
  logoContainerHeight?: string;
  logoContainerMinWidth?: string;
  logoImageWidth?: string;
  logoImageHeight?: string;
  logoMaxWidth?: string;
  logoMaxHeight?: string;
};

const MOBILE_BASIS: Record<
  NonNullable<AnimatedCarouselProps["itemsPerViewMobile"]>,
  string
> = {
  2: "basis-1/2",
  3: "basis-1/3",
  4: "basis-1/4",
  5: "basis-1/5",
};

const DESKTOP_BASIS: Record<
  NonNullable<AnimatedCarouselProps["itemsPerViewDesktop"]>,
  string
> = {
  3: "lg:basis-1/3",
  4: "lg:basis-1/4",
  5: "lg:basis-1/5",
  6: "lg:basis-1/6",
};

const ITEM_GAP: Record<ItemGap, { content: string; item: string }> = {
  sm: { content: "-ml-2 md:-ml-3", item: "pl-2 md:pl-3" },
  md: { content: "-ml-3 md:-ml-4 lg:-ml-6", item: "pl-3 md:pl-4 lg:pl-6" },
  lg: { content: "-ml-4 md:-ml-6 lg:-ml-8", item: "pl-4 md:pl-6 lg:pl-8" },
};

function normalizeLogo(logo: string | LogoItem, index: number): LogoItem {
  if (typeof logo === "string") {
    return { src: logo, alt: `Logo ${index + 1}` };
  }

  return {
    src: logo.src,
    alt: logo.alt,
    label: logo.label,
  };
}

export function AnimatedCarousel({
  title,
  logoCount = 15,
  autoPlay = true,
  autoPlayInterval = 1000,
  logos = null,
  containerClassName = "",
  contentClassName = "container mx-auto px-4",
  titleClassName = "",
  carouselClassName = "",
  logoClassName = "",
  itemsPerViewMobile = 4,
  itemsPerViewDesktop = 6,
  itemGap = "lg",
  spacing = "gap-10",
  padding = "py-12 md:py-16",
  logoContainerWidth = "w-48",
  logoContainerHeight = "h-24",
  logoContainerMinWidth = "min-w-[10rem] md:min-w-[12rem]",
  logoImageWidth = "w-full",
  logoImageHeight = "h-full",
  logoMaxWidth = "",
  logoMaxHeight = "",
}: AnimatedCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const gapClasses = ITEM_GAP[itemGap];

  useEffect(() => {
    if (!api || !autoPlay) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent((value) => value + 1);
      }
    }, autoPlayInterval);

    return () => {
      window.clearTimeout(timer);
    };
  }, [api, current, autoPlay, autoPlayInterval]);

  const logoItems: LogoItem[] =
    logos?.map(normalizeLogo) ??
    Array.from({ length: logoCount }, (_, index): LogoItem => ({
      label: `Logo ${index + 1}`,
    }));

  const logoImageSizeClasses = cn(
    logoImageWidth,
    logoImageHeight,
    logoMaxWidth,
    logoMaxHeight,
    "object-contain grayscale opacity-70 transition-[filter,opacity] duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-focus-within:grayscale-0 group-focus-within:opacity-100",
  );

  return (
    <div
      className={cn(
        "w-full bg-[var(--bg-secondary)]",
        padding,
        containerClassName,
      )}
    >
      <div className={cn(contentClassName)}>
        <div className={cn("flex flex-col", spacing)}>
          {title ? (
            <h2
              className={cn(
                "ml-2 text-left text-xl tracking-tighter text-[var(--text-primary)] md:text-3xl lg:max-w-xl lg:text-5xl",
                titleClassName,
              )}
            >
              <TextRoll>{title}</TextRoll>
            </h2>
          ) : null}

          <div>
            <Carousel
              setApi={setApi}
              opts={{ align: "start", loop: true }}
              className={cn("w-full", carouselClassName)}
              data-testid="logo-carousel"
            >
              <CarouselContent className={gapClasses.content}>
                {logoItems.map((logo, index) => {
                  const rawSrc = logo.src?.trim() || "";
                  const logoUrl =
                    rawSrc && isAllowedNextImageSrc(rawSrc) ? rawSrc : null;
                  const logoAlt =
                    logo.alt?.trim() || logo.label?.trim() || `Logo ${index + 1}`;
                  const fallbackLabel =
                    logo.label?.trim() || logo.alt?.trim() || `Logo ${index + 1}`;

                  return (
                    <CarouselItem
                      aria-label={`${index + 1} of ${logoItems.length}`}
                      className={cn(
                        MOBILE_BASIS[itemsPerViewMobile],
                        DESKTOP_BASIS[itemsPerViewDesktop],
                        gapClasses.item,
                      )}
                      key={`${logoUrl ?? fallbackLabel}-${index}`}
                    >
                      <div
                        className={cn(
                          "group flex min-h-16 items-center justify-center border-0 bg-transparent px-2 py-4 text-sm font-medium uppercase tracking-wide text-[var(--text-muted)] shadow-none sm:px-4 md:px-6",
                          logoContainerMinWidth,
                          logoContainerWidth,
                          logoContainerHeight,
                          logoClassName,
                        )}
                      >
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={logoAlt}
                            width={160}
                            height={48}
                            className={cn(
                              logoImageSizeClasses,
                              "h-10 w-auto max-w-full md:h-12",
                            )}
                          />
                        ) : (
                          fallbackLabel
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
}
