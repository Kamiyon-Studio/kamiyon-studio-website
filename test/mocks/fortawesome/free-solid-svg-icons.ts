import { createMockIcon } from "./icon-name";

/** Hermetic stand-in for `@fortawesome/free-solid-svg-icons` under Vitest. */
export const faEnvelope = createMockIcon("faEnvelope", "fas");
export const faArrowLeft = createMockIcon("faArrowLeft", "fas");
export const faArrowRight = createMockIcon("faArrowRight", "fas");
export const faArrowUpRightFromSquare = createMockIcon(
  "faArrowUpRightFromSquare",
  "fas",
);
export const faChevronLeft = createMockIcon("faChevronLeft", "fas");
export const faChevronRight = createMockIcon("faChevronRight", "fas");
export const faXmark = createMockIcon("faXmark", "fas");
