"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

import "./TiltedCard.css";

/** Sensible defaults when wrapping marketing UI cards (not demo image cards). */
export const marketingCardTiltProps = {
  containerHeight: "100%",
  containerWidth: "100%",
  scaleOnHover: 1.03,
  rotateAmplitude: 10,
  showMobileWarning: false,
  showTooltip: false,
} as const;

export type TiltedCardProps = {
  imageSrc?: string;
  altText?: string;
  captionText?: string;
  containerHeight?: string;
  containerWidth?: string;
  imageHeight?: string;
  imageWidth?: string;
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: ReactNode;
  displayOverlayContent?: boolean;
  children?: ReactNode;
  className?: string;
};

type TiltState = {
  rotateX: number;
  rotateY: number;
  scale: number;
  captionX: number;
  captionY: number;
  captionOpacity: number;
  captionRotate: number;
};

const idleTilt: TiltState = {
  rotateX: 0,
  rotateY: 0,
  scale: 1,
  captionX: 0,
  captionY: 0,
  captionOpacity: 0,
  captionRotate: 0,
};

/**
 * 3D mouse-follow tilt with CSS transitions (no Framer Motion).
 */
export function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "300px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = true,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  children,
  className = "",
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const isContentMode = Boolean(children);
  const [tilt, setTilt] = useState<TiltState>(idleTilt);
  const lastYRef = useRef(0);
  const reduceMotion = useReducedMotion();

  function handleMouse(e: MouseEvent<HTMLElement>) {
    if (prefersReducedMotion() || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;
    const velocityY = offsetY - lastYRef.current;
    lastYRef.current = offsetY;

    setTilt({
      rotateX: rotationX,
      rotateY: rotationY,
      scale: scaleOnHover,
      captionX: e.clientX - rect.left,
      captionY: e.clientY - rect.top,
      captionOpacity: 1,
      captionRotate: -velocityY * 0.6,
    });
  }

  function handleMouseLeave() {
    setTilt(idleTilt);
    lastYRef.current = 0;
  }

  const figureClassName = [
    "tilted-card-figure",
    isContentMode ? "tilted-card-figure--content" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const innerStyle: CSSProperties = isContentMode
    ? {
        width: "100%",
        transform: reduceMotion
          ? undefined
          : `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
        transition: "transform 0.2s ease-out",
      }
    : {
        width: imageWidth,
        height: imageHeight,
        transform: reduceMotion
          ? undefined
          : `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
        transition: "transform 0.2s ease-out",
      };

  return (
    <figure
      ref={ref}
      className={figureClassName}
      style={{
        height: containerHeight,
        width: containerWidth,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning ? (
        <div className="tilted-card-mobile-alert">
          This effect is not optimized for mobile. Check on desktop.
        </div>
      ) : null}

      <div
        className={[
          "tilted-card-inner",
          isContentMode ? "tilted-card-inner--content" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={innerStyle}
      >
        {children ? (
          <div className="tilted-card-body">{children}</div>
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt={altText}
            className="tilted-card-img"
            style={{
              width: imageWidth,
              height: imageHeight,
            }}
          />
        ) : null}

        {displayOverlayContent && overlayContent ? (
          <div className="tilted-card-overlay">{overlayContent}</div>
        ) : null}
      </div>

      {showTooltip ? (
        <figcaption
          className="tilted-card-caption"
          style={{
            transform: reduceMotion
              ? undefined
              : `translate(${tilt.captionX}px, ${tilt.captionY}px) rotate(${tilt.captionRotate}deg)`,
            opacity: reduceMotion ? 0 : tilt.captionOpacity,
            transition: "opacity 0.2s ease-out, transform 0.1s linear",
          }}
        >
          {captionText}
        </figcaption>
      ) : null}
    </figure>
  );
}
