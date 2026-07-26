"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";

import { REDUCED_MOTION_QUERY } from "@/lib/motion/reduced-motion";

import "./ScrollStack.css";

export type ScrollStackItemProps = {
  itemClassName?: string;
  children: ReactNode;
};

export function ScrollStackItem({
  children,
  itemClassName = "",
}: ScrollStackItemProps) {
  return (
    <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
  );
}

type CardTransform = {
  translateY: number;
  scale: number;
  rotation: number;
};

export type ScrollStackProps = {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
};

/**
 * Layout offset for an element, ignoring CSS transforms on the element itself.
 * `getBoundingClientRect()` includes transforms — using it while pinning creates
 * a feedback loop (cards clump / z-fight). `offsetTop` is transform-invariant.
 */
export function getTransformInvariantOffsetTop(
  element: HTMLElement,
  useWindowScroll: boolean
): number {
  if (!useWindowScroll) {
    return element.offsetTop;
  }

  let top = 0;
  let node: HTMLElement | null = element;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

/**
 * React Bits ScrollStack (TS + CSS), adapted for Kamiyon:
 * - When `useWindowScroll`, uses document scroll + native listeners.
 * - Otherwise uses the scroller element's native overflow scroll.
 * - Card queries stay scoped to this component instance.
 * - Layout offsets are cached from transform-invariant measurements so pin math
 *   stays stable while cards are translated.
 */
export default function ScrollStack({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  scaleDuration: _scaleDuration = 0.5,
  rotationAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const cardTopsRef = useRef<number[]>([]);
  const endTopRef = useRef(0);
  const lastTransformsRef = useRef(new Map<number, CardTransform>());
  const isUpdatingRef = useRef(false);

  const calculateProgress = useCallback(
    (scrollTop: number, start: number, end: number) => {
      if (scrollTop < start) return 0;
      if (scrollTop > end) return 1;
      return (scrollTop - start) / (end - start);
    },
    []
  );

  const parsePercentage = useCallback(
    (value: string | number, containerHeight: number) => {
      if (typeof value === "string" && value.includes("%")) {
        return (parseFloat(value) / 100) * containerHeight;
      }
      return typeof value === "number" ? value : parseFloat(value);
    },
    []
  );

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
      };
    }

    const scroller = scrollerRef.current;
    return {
      scrollTop: scroller?.scrollTop ?? 0,
      containerHeight: scroller?.clientHeight ?? 0,
    };
  }, [useWindowScroll]);

  const measureLayoutPositions = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    cardTopsRef.current = cards.map((card) =>
      getTransformInvariantOffsetTop(card, useWindowScroll)
    );

    const endElement = scrollerRef.current?.querySelector(
      ".scroll-stack-end"
    ) as HTMLElement | null;
    endTopRef.current = endElement
      ? getTransformInvariantOffsetTop(endElement, useWindowScroll)
      : 0;
  }, [useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
    const endElementTop = endTopRef.current;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = cardTopsRef.current[i] ?? 0;
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform: CardTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1;

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
  ]);

  const handleScroll = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  const handleResize = useCallback(() => {
    measureLayoutPositions();
    updateCardTransforms();
  }, [measureLayoutPositions, updateCardTransforms]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const prefersReducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    const cards = Array.from(
      scroller.querySelectorAll(".scroll-stack-card")
    ) as HTMLElement[];

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      // Later cards paint above earlier ones — prevents bleed/z-fight while stacking.
      card.style.zIndex = String(i + 1);
      card.style.willChange = "transform";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.transform = "translate3d(0, 0, 0)";
    });

    measureLayoutPositions();

    if (prefersReducedMotion) {
      updateCardTransforms();
      return () => {
        stackCompletedRef.current = false;
        cardsRef.current = [];
        cardTopsRef.current = [];
        transformsCache.clear();
        isUpdatingRef.current = false;
      };
    }

    if (useWindowScroll) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleResize);
      updateCardTransforms();

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleResize);
        if (scrollRafRef.current !== null) {
          cancelAnimationFrame(scrollRafRef.current);
          scrollRafRef.current = null;
        }
        stackCompletedRef.current = false;
        cardsRef.current = [];
        cardTopsRef.current = [];
        transformsCache.clear();
        isUpdatingRef.current = false;
      };
    }

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    updateCardTransforms();

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      cardTopsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    useWindowScroll,
    handleScroll,
    handleResize,
    measureLayoutPositions,
    updateCardTransforms,
  ]);

  const scrollerClassName = [
    "scroll-stack-scroller",
    useWindowScroll ? "scroll-stack-scroller--window" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={scrollerClassName} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
}
