import { KeyboardEvent, useEffect, useRef, useState, useCallback, RefObject } from "react";

// Hook 1: useHeadlessGrid
export interface UseHeadlessGridProps {
  itemsCount: number;
  label?: string;
}

export function useHeadlessGrid({ itemsCount, label }: UseHeadlessGridProps) {
  const getGridProps = useCallback(() => {
    return {
      role: "grid",
      "aria-label": label || "Media grid",
      "aria-rowcount": itemsCount,
    };
  }, [itemsCount, label]);

  const getGridRowProps = useCallback((index: number) => {
    return {
      role: "row",
      "aria-rowindex": index + 1,
    };
  }, []);

  const getGridCellProps = useCallback((index: number) => {
    return {
      role: "gridcell",
      "aria-colindex": 1,
    };
  }, []);

  return {
    getGridProps,
    getGridRowProps,
    getGridCellProps,
  };
}

// Hook 2: useHeadlessLightbox
export interface UseHeadlessLightboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export function useHeadlessLightbox({ isOpen, onClose }: UseHeadlessLightboxProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      lastActiveElement.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll(
          'a[href], button, video, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Put focus inside the modal on load
    const timer = setTimeout(() => {
      const firstFocus = contentRef.current?.querySelector(
        "button, a, video"
      ) as HTMLElement;
      firstFocus?.focus();
    }, 100);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  const getBackdropProps = useCallback(() => {
    return {
      ref: backdropRef,
      onClick: (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) {
          onClose();
        }
      },
      role: "dialog",
      "aria-modal": true,
    };
  }, [onClose]);

  const getContentProps = useCallback(() => {
    return {
      ref: contentRef,
      tabIndex: -1,
    };
  }, []);

  const getCloseButtonProps = useCallback(() => {
    return {
      onClick: onClose,
      type: "button" as const,
      "aria-label": "Close dialog",
    };
  }, [onClose]);

  return {
    backdropRef,
    contentRef,
    getBackdropProps,
    getContentProps,
    getCloseButtonProps,
  };
}

// Hook 3: useHeadlessReelSwiper
export interface UseHeadlessReelSwiperProps {
  itemsCount: number;
  onIndexChange?: (index: number) => void;
}

export function useHeadlessReelSwiper({ itemsCount, onIndexChange }: UseHeadlessReelSwiperProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Store refs to each slide element
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Use IntersectionObserver to detect which slide is centered on screen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio — that's the active slide
        let maxRatio = 0;
        let maxIndex = -1;
        entries.forEach((entry) => {
          const index = parseInt((entry.target as HTMLElement).dataset.slideIndex || "-1", 10);
          if (entry.intersectionRatio > maxRatio && index >= 0) {
            maxRatio = entry.intersectionRatio;
            maxIndex = index;
          }
        });
        if (maxIndex >= 0 && maxRatio >= 0.5) {
          setActiveIndex((prev) => {
            if (prev !== maxIndex) {
              onIndexChange?.(maxIndex);
              return maxIndex;
            }
            return prev;
          });
        }
      },
      {
        root: container,
        // Trigger at multiple thresholds for smooth detection
        threshold: [0.5, 0.75, 1.0],
      }
    );

    // Observe all registered slide elements
    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, [itemsCount, onIndexChange]);

  // Callback for consumers to register a slide element
  const registerSlide = useCallback((index: number) => (el: HTMLDivElement | null) => {
    slideRefs.current[index] = el;
    if (el) el.dataset.slideIndex = String(index);
  }, []);

  const getContainerProps = useCallback(() => {
    return {
      ref: containerRef,
      style: {
        scrollSnapType: "y mandatory" as const,
        overflowY: "auto" as const,
        display: "flex" as const,
        flexDirection: "column" as const,
      },
    };
  }, []);

  const getSlideProps = useCallback((index: number) => {
    return {
      style: {
        scrollSnapAlign: "center" as const,
        flexShrink: 0 as const,
      },
      "aria-roledescription": "slide",
      role: "group" as const,
      "aria-label": `Slide ${index + 1} of ${itemsCount}`,
    };
  }, [itemsCount]);

  const scrollToSlide = useCallback((index: number) => {
    const slide = slideRefs.current[index];
    if (slide) {
      slide.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  return {
    activeIndex,
    containerRef,
    slideRefs,
    registerSlide,
    getContainerProps,
    getSlideProps,
    scrollToSlide,
  };
}
