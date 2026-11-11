"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { cn } from "@/lib/utils";

interface ProgressSliderContextType {
  active: string;
  progress: MotionValue<number>;
  handleButtonClick: (value: string) => void;
  vertical: boolean;
}

interface ProgressSliderProps {
  children: ReactNode;
  duration?: number;
  fastDuration?: number;
  vertical?: boolean;
  activeSlider: string;
  className?: string;
}

interface SliderContentProps {
  children: ReactNode;
  className?: string;
}

interface SliderWrapperProps {
  children: ReactNode;
  value: string;
  className?: string;
}

interface ProgressBarProps {
  children: ReactNode;
  className?: string;
}

interface SliderBtnProps {
  children: ReactNode;
  value: string;
  className?: string;
  progressBarClass?: string;
}

const ProgressSliderContext = createContext<
  ProgressSliderContextType | undefined
>(undefined);

export const useProgressSliderContext = (): ProgressSliderContextType => {
  const context = useContext(ProgressSliderContext);
  if (!context) {
    throw new Error(
      "useProgressSliderContext must be used within a ProgressSlider",
    );
  }
  return context;
};

function wrapperValuesFromChildren(children: ReactNode): string[] {
  const content = (Array.isArray(children) ? children : [children]).find(
    (child) =>
      child !== null &&
      typeof child === "object" &&
      "type" in child &&
      child.type === SliderContent,
  ) as ReactElement<SliderContentProps> | undefined;

  if (!content) {
    return [];
  }

  return (
    Array.isArray(content.props.children)
      ? content.props.children
      : [content.props.children]
  )
    .map((child) => {
      if (
        child !== null &&
        typeof child === "object" &&
        "props" in child &&
        typeof (child as ReactElement<SliderWrapperProps>).props.value ===
          "string"
      ) {
        return (child as ReactElement<SliderWrapperProps>).props.value;
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
}

export const ProgressSlider: FC<ProgressSliderProps> = ({
  children,
  duration = 5000,
  fastDuration = 400,
  vertical = false,
  activeSlider,
  className,
}) => {
  const [active, setActive] = useState<string>(activeSlider);
  const progress = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    if (rootRef.current) observer.observe(rootRef.current);
    const sync = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const [isFastForward, setIsFastForward] = useState<boolean>(false);
  const frame = useRef<number>(0);
  const firstFrameTime = useRef<number>(0);
  const startProgress = useRef<number>(0);
  const targetValue = useRef<string | null>(null);
  const valuesKey = wrapperValuesFromChildren(children).join("\0");

  useEffect(() => {
    const sliderValues = valuesKey ? valuesKey.split("\0") : [];
    if (
      sliderValues.length < 2 ||
      paused ||
      reduceMotion ||
      !visible ||
      !documentVisible
    ) {
      return;
    }

    firstFrameTime.current = performance.now();
    startProgress.current = 0;

    const animate = (now: number) => {
      const currentDuration = isFastForward ? fastDuration : duration;
      const elapsedTime = now - firstFrameTime.current;
      const timeFraction = elapsedTime / currentDuration;

      if (timeFraction <= 1) {
        const next = isFastForward
          ? startProgress.current + (100 - startProgress.current) * timeFraction
          : timeFraction * 100;
        progress.set(next);
        frame.current = requestAnimationFrame(animate);
        return;
      }

      if (isFastForward) {
        setIsFastForward(false);
        if (targetValue.current !== null) {
          setActive(targetValue.current);
          targetValue.current = null;
        }
      } else {
        const currentIndex = sliderValues.indexOf(active);
        const nextIndex = (currentIndex + 1) % sliderValues.length;
        setActive(sliderValues[nextIndex] ?? sliderValues[0] ?? active);
      }

      progress.set(0);
      startProgress.current = 0;
    };

    frame.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, [
    valuesKey,
    active,
    isFastForward,
    duration,
    fastDuration,
    paused,
    reduceMotion,
    progress,
    visible,
    documentVisible,
  ]);

  const handleButtonClick = (value: string) => {
    if (value === active) {
      return;
    }

    if (paused || reduceMotion) {
      setIsFastForward(false);
      targetValue.current = null;
      setActive(value);
      progress.set(0);
      return;
    }
    const elapsedTime = performance.now() - firstFrameTime.current;
    startProgress.current = Math.min((elapsedTime / duration) * 100, 100);
    progress.set(startProgress.current);
    targetValue.current = value;
    setIsFastForward(true);
    firstFrameTime.current = performance.now();
  };

  return (
    <ProgressSliderContext.Provider
      value={{ active, progress, handleButtonClick, vertical }}
    >
      <div ref={rootRef} className={cn("relative", className)}>
        {children}
        {valuesKey.includes("\0") && !reduceMotion ? (
          <button
            type="button"
            className="relative z-10 mt-3 min-h-11 rounded border px-4 py-2 text-sm"
            onClick={() => setPaused(!paused)}
            aria-pressed={paused}
          >
            {paused ? "Resume slideshow" : "Pause slideshow"}
          </button>
        ) : null}
      </div>
    </ProgressSliderContext.Provider>
  );
};

export const SliderContent: FC<SliderContentProps> = ({
  children,
  className,
}) => {
  return <div className={cn("", className)}>{children}</div>;
};

export const SliderWrapper: FC<SliderWrapperProps> = ({
  children,
  value,
  className,
}) => {
  const { active } = useProgressSliderContext();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="popLayout">
      {active === value && (
        <motion.div
          key={value}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : undefined}
          className={cn("", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SliderBtnGroup: FC<ProgressBarProps> = ({
  children,
  className,
}) => {
  return <div className={cn("", className)}>{children}</div>;
};

export const SliderBtn: FC<SliderBtnProps> = ({
  children,
  value,
  className,
  progressBarClass,
}) => {
  const { active, progress, handleButtonClick, vertical } =
    useProgressSliderContext();
  const progressSize = useTransform(progress, (value) => `${value}%`);

  return (
    <button
      type="button"
      className={cn(
        `relative ${active === value ? "opacity-100" : "opacity-50"}`,
        className,
      )}
      onClick={() => handleButtonClick(value)}
    >
      {children}
      <div
        className="absolute inset-0 -z-10 max-h-full max-w-full overflow-hidden"
        aria-hidden="true"
      >
        <motion.span
          className={cn("absolute left-0", progressBarClass)}
          style={{
            [vertical ? "height" : "width"]:
              active === value ? progressSize : "0%",
          }}
        />
      </div>
    </button>
  );
};
