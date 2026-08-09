import type { gsap as GSAPType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

// ---------------------------------------------------------------------------
// Reduced-motion detection
// Returns false on the server (window is undefined) so animations are never
// initialised during SSR, which avoids hydration mismatches.
// ---------------------------------------------------------------------------
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ---------------------------------------------------------------------------
// Cleanup helper
// Reverts a GSAP context and kills any standalone ScrollTrigger instances.
// Call this inside the cleanup function returned by useEffect / useLayoutEffect.
// ---------------------------------------------------------------------------
export function cleanupAnimation(
  ctx: ReturnType<typeof GSAPType.context> | null,
  triggers?: InstanceType<typeof ScrollTriggerType>[]
): void {
  if (triggers && triggers.length > 0) {
    triggers.forEach((t) => t?.kill());
  }
  ctx?.revert();
}
