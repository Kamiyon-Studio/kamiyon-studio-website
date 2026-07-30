"use client";

import * as React from "react";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faChevronLeft,
  faChevronRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type FocusRailItem = {
  id: string | number;
  title: string;
  description?: string;
  imageSrc: string;
  href?: string;
  meta?: string;
};

interface FocusRailProps {
  items: FocusRailItem[];
  initialIndex?: number;
  loop?: boolean;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

/** Helper to wrap indices (e.g., -1 becomes length-1). */
function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

/** Base spring for spatial movement (x/z). */
const BASE_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

/** Scale spring — bouncier for visual "tap" feedback on the center card. */
const TAP_SPRING = {
  type: "spring" as const,
  stiffness: 450,
  damping: 18,
  mass: 1,
};

const DRAG_CLICK_THRESHOLD = 12;

function FocusRailCardModal({
  item,
  onClose,
}: {
  item: FocusRailItem;
  onClose: () => void;
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6 sm:pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      data-testid="focus-rail-modal"
    >
      <button
        type="button"
        aria-label="Close details"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="focus-rail-modal-title"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative z-10 flex max-h-[min(90dvh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 text-white shadow-2xl md:grid md:max-h-[min(85dvh,640px)] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
        data-testid="focus-rail-modal-card"
      >
        <div className="relative h-44 w-full shrink-0 sm:h-52 md:h-auto md:min-h-0 md:self-stretch">
          {/* eslint-disable-next-line @next/next/no-img-element -- rail supports Unsplash + CMS hosts */}
          <img
            src={item.imageSrc}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent md:bg-gradient-to-r" />
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-20 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 md:top-4 md:right-4"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
          </button>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-4 pr-14 sm:px-6 sm:pt-6 md:px-8 md:pt-8">
            <div className="space-y-3">
              {item.meta ? (
                <p className="text-xs font-medium tracking-wider text-[var(--color-primary)] uppercase">
                  {item.meta}
                </p>
              ) : null}
              <h3
                id="focus-rail-modal-title"
                className="font-display text-2xl font-black tracking-tight sm:text-3xl md:text-4xl"
              >
                {item.title}
              </h3>
              {item.description ? (
                <p className="text-sm leading-relaxed text-neutral-300 sm:text-base md:text-lg">
                  {item.description}
                </p>
              ) : (
                <p className="text-sm text-neutral-500">More details coming soon.</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-white/10 px-5 py-4 sm:px-6 md:px-8">
            {item.href ? (
              <Link
                href={item.href}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
              >
                Explore
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-3 text-sm text-neutral-400 transition hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FocusRail({
  items,
  initialIndex = 0,
  loop = true,
  autoPlay = false,
  interval = 4000,
  className,
}: FocusRailProps) {
  const count = items.length;
  const safeInitial =
    count === 0 ? 0 : Math.min(Math.max(initialIndex, 0), count - 1);
  const [active, setActive] = React.useState(safeInitial);
  const [isHovering, setIsHovering] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const lastWheelTime = React.useRef<number>(0);
  const dragDistance = React.useRef(0);

  const activeIndex = count === 0 ? 0 : wrap(0, count, active);
  const activeItem = count === 0 ? undefined : items[activeIndex];

  const handlePrev = React.useCallback(() => {
    if (count === 0) return;
    if (!loop && active === 0) return;
    setActive((p) => p - 1);
  }, [loop, active, count]);

  const handleNext = React.useCallback(() => {
    if (count === 0) return;
    if (!loop && active === count - 1) return;
    setActive((p) => p + 1);
  }, [loop, active, count]);

  const openModal = React.useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setModalOpen(false);
  }, []);

  const onWheel = React.useCallback(
    (e: React.WheelEvent) => {
      if (modalOpen) return;
      const now = Date.now();
      if (now - lastWheelTime.current < 400) return;

      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isHorizontal ? e.deltaX : e.deltaY;

      if (Math.abs(delta) > 20) {
        if (delta > 0) {
          handleNext();
        } else {
          handlePrev();
        }
        lastWheelTime.current = now;
      }
    },
    [handleNext, handlePrev, modalOpen],
  );

  React.useEffect(() => {
    if (!autoPlay || isHovering || count === 0 || modalOpen) return;
    const timer = setInterval(() => handleNext(), interval);
    return () => clearInterval(timer);
  }, [autoPlay, isHovering, handleNext, interval, count, modalOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (modalOpen) return;
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal();
    }
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const onDrag = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    dragDistance.current = Math.max(
      dragDistance.current,
      Math.abs(info.offset.x),
    );
  };

  const onDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo,
  ) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      handleNext();
    } else if (swipe > swipeConfidenceThreshold) {
      handlePrev();
    }
  };

  if (count === 0 || !activeItem) {
    return null;
  }

  const visibleIndices = [-2, -1, 0, 1, 2];

  return (
    <>
      <div
        className={cn(
          "group relative flex h-[560px] w-full flex-col overflow-hidden overflow-x-hidden bg-neutral-950 text-white outline-none select-none",
          className,
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Focus rail"
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        data-testid="focus-rail"
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`bg-${activeItem.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- rail supports Unsplash + CMS hosts */}
              <img
                src={activeItem.imageSrc}
                alt=""
                className="h-full w-full object-cover blur-3xl saturate-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-4 md:px-8">
          <motion.div
            className="relative mx-auto flex h-[360px] w-full max-w-6xl cursor-grab items-center justify-center perspective-[1200px] active:cursor-grabbing"
            drag={modalOpen ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => {
              dragDistance.current = 0;
            }}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
          >
            {visibleIndices.map((offset) => {
              const absIndex = active + offset;
              const index = wrap(0, count, absIndex);
              const item = items[index];

              if (!loop && (absIndex < 0 || absIndex >= count)) return null;
              if (!item) return null;

              const isCenter = offset === 0;
              const dist = Math.abs(offset);

              const xOffset = offset * 320;
              const zOffset = -dist * 180;
              const scale = isCenter ? 1 : 0.85;
              const rotateY = offset * -20;

              const opacity = isCenter ? 1 : Math.max(0.1, 1 - dist * 0.5);
              const blur = isCenter ? 0 : dist * 6;
              const brightness = isCenter ? 1 : 0.5;

              return (
                <motion.div
                  key={absIndex}
                  className={cn(
                    "absolute aspect-[3/4] w-[260px] rounded-2xl border-t border-white/20 bg-neutral-900 shadow-2xl transition-shadow duration-300 md:w-[300px]",
                    isCenter
                      ? "z-20 cursor-pointer shadow-white/10"
                      : "z-10",
                  )}
                  initial={false}
                  animate={{
                    x: xOffset,
                    z: zOffset,
                    scale,
                    rotateY,
                    opacity,
                    filter: `blur(${blur}px) brightness(${brightness})`,
                  }}
                  transition={{ default: BASE_SPRING, scale: TAP_SPRING }}
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                  onClick={() => {
                    if (offset !== 0) {
                      setActive((p) => p + offset);
                      return;
                    }
                    if (dragDistance.current > DRAG_CLICK_THRESHOLD) return;
                    openModal();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- rail supports Unsplash + CMS hosts */}
                  <img
                    src={item.imageSrc}
                    alt={item.title}
                    className="pointer-events-none h-full w-full rounded-2xl object-cover"
                  />

                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-black/10 mix-blend-multiply" />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Minimized active label — title + meta only; details live in the modal */}
          <div className="pointer-events-auto mx-auto mt-10 flex w-full max-w-4xl flex-col items-center justify-between gap-5 md:flex-row">
            <button
              type="button"
              onClick={openModal}
              className="flex min-h-16 flex-1 flex-col items-center justify-center rounded-xl text-center transition hover:bg-white/5 md:items-start md:px-2 md:text-left"
              aria-label={`Open details for ${activeItem.title}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeItem.id}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.25 }}
                  className="space-y-1"
                >
                  {activeItem.meta ? (
                    <span className="text-xs font-medium tracking-wider text-[var(--color-primary)] uppercase">
                      {activeItem.meta}
                    </span>
                  ) : null}
                  <span className="block font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
                    {activeItem.title}
                  </span>
                </motion.div>
              </AnimatePresence>
            </button>

            <div className="flex items-center gap-1 rounded-full bg-neutral-900/80 p-1 ring-1 ring-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={handlePrev}
                className="rounded-full p-3 text-neutral-400 transition hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="Previous"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
              </button>
              <span className="min-w-[40px] text-center font-mono text-xs text-neutral-500">
                {activeIndex + 1} / {count}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="rounded-full p-3 text-neutral-400 transition hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="Next"
              >
                <FontAwesomeIcon icon={faChevronRight} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen ? (
          <FocusRailCardModal item={activeItem} onClose={closeModal} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
