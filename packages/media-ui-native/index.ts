// Headless hooks contract for React Native
export interface UseHeadlessGridProps {
  itemsCount: number;
  label?: string;
}

export function useHeadlessGrid({ itemsCount, label }: UseHeadlessGridProps) {
  return {
    getGridProps: () => ({
      accessibilityLabel: label || "Media grid",
      accessibilityRole: "grid" as const,
    }),
    getGridRowProps: (index: number) => ({
      accessibilityRole: "row" as const,
    }),
    getGridCellProps: (index: number) => ({
      accessibilityRole: "gridcell" as const,
    }),
  };
}

export interface UseHeadlessLightboxProps {
  isOpen: boolean;
  onClose: () => void;
}

export function useHeadlessLightbox({ isOpen, onClose }: UseHeadlessLightboxProps) {
  return {
    backdropRef: { current: null },
    contentRef: { current: null },
    getBackdropProps: () => ({
      accessibilityViewIsModal: true,
      accessibilityRole: "dialog" as const,
    }),
    getContentProps: () => ({}),
    getCloseButtonProps: () => ({
      onPress: onClose,
      accessibilityRole: "button" as const,
      accessibilityLabel: "Close dialog",
    }),
  };
}

export interface UseHeadlessReelSwiperProps {
  itemsCount: number;
  onIndexChange?: (index: number) => void;
}

export function useHeadlessReelSwiper({ itemsCount, onIndexChange }: UseHeadlessReelSwiperProps) {
  return {
    activeIndex: 0,
    containerRef: { current: null },
    getContainerProps: () => ({
      pagingEnabled: true,
      horizontal: false,
    }),
    getSlideProps: (index: number) => ({
      accessibilityRole: "group" as const,
      accessibilityLabel: `Slide ${index + 1} of ${itemsCount}`,
    }),
    scrollToSlide: (index: number) => {},
  };
}
