/** Accessible slide label for screen readers, e.g. "Slide 2 of 4: Game Development". */
export function formatCarouselSlideLabel(
  index: number,
  total: number,
  title: string
): string {
  return `Slide ${index + 1} of ${total}: ${title}`;
}

/** Wrap carousel index when navigating by delta (+1 next, -1 previous). */
export function wrapCarouselIndex(
  currentIndex: number,
  delta: number,
  total: number
): number {
  if (total <= 0) {
    return 0;
  }

  return ((currentIndex + delta) % total + total) % total;
}

/** Roving tabindex: active control receives focus in tab order; others are skipped. */
export function getRovingTabIndex(activeIndex: number, itemIndex: number): 0 | -1 {
  return activeIndex === itemIndex ? 0 : -1;
}

/** Clamp a raw index into the valid slide range. */
export function clampCarouselIndex(index: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(index, total - 1));
}
