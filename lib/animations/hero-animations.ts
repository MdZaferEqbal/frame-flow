/**
 * hero-animations.ts
 *
 * All GSAP animation logic for the hero section — kept separate from JSX so
 * components stay clean and animation parameters are easy to tune.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./gsap-utils";

// Register the plugin once at module scope.
// This is safe because this module is only ever imported by client components.
gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface HeroIntroRefs {
  /** The outermost wrapper div (gsap.context scope) */
  wrapper: HTMLElement;
  /** <header> element */
  header: HTMLElement;
  /** The large display heading element */
  heading: HTMLElement;
  /** Small body-text block on the right side */
  bodyRight: HTMLElement;
  /** Small body-text block on the left side */
  bodyLeft: HTMLElement;
  /** The full-bleed image layer */
  image: HTMLElement;
  /** Year badge */
  badge: HTMLElement | null;
}

export interface HeroScrollRefs {
  /** The hero <section> to tilt and move behind the next section */
  heroSection: HTMLElement;
  /** The wrapper that provides the 3-D perspective context */
  perspectiveWrapper: HTMLElement;
}

export interface GalleryScrollRefs {
  /** The gallery <section> that will tilt forward */
  gallerySection: HTMLElement | null;
  /** The wrapper that provides the 3-D perspective context */
  perspectiveWrapper: HTMLDivElement | null;
}

// ---------------------------------------------------------------------------
// Intro animation
// Runs once on mount. Returns a gsap.context() for clean teardown.
// ---------------------------------------------------------------------------
export function createHeroIntroAnimation(
  refs: HeroIntroRefs
): ReturnType<typeof gsap.context> {
  if (prefersReducedMotion()) {
    // Make everything immediately visible — no animation.
    const targets = [
      refs.header,
      refs.heading,
      refs.bodyRight,
      refs.bodyLeft,
      refs.image,
      ...(refs.badge ? [refs.badge] : []),
    ];
    gsap.set(targets, { opacity: 1, y: 0, scale: 1 });
    return gsap.context(() => { });
  }

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Hero image — fade in and very subtly de-scale to neutral
    tl.fromTo(
      refs.image,
      { opacity: 0, scale: 1.05 },
      { opacity: 1, scale: 1, duration: 1.2 },
      0 // starts at t=0
    );

    // 2. Header — slide down gently from above
    tl.fromTo(
      refs.header,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.7 },
      0.3
    );

    // 3. Display heading — slide up and fade in
    tl.fromTo(
      refs.heading,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.9 },
      0.5
    );

    // 4. Supporting text blocks — staggered after heading
    tl.fromTo(
      [refs.bodyRight, refs.bodyLeft],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 },
      0.85
    );

    // 5. Year badge (only if the element exists)
    if (refs.badge) {
      tl.fromTo(
        refs.badge,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5 },
        1.1
      );
    }
  }, refs.wrapper);

  return ctx;
}

// ---------------------------------------------------------------------------
// Scroll tilt animation
// The hero panel gently tilts backward and moves behind the next section.
// Returns a cleanup function that kills the ScrollTrigger instance.
// ---------------------------------------------------------------------------
export function createHeroScrollAnimation(
  refs: HeroScrollRefs
): () => void {
  if (prefersReducedMotion()) {
    return () => { };
  }

  // Add perspective on the wrapper so rotationX works in 3-D space
  gsap.set(refs.perspectiveWrapper, {
    perspective: 1000,
    transformStyle: "preserve-3d",
  });

  const st = ScrollTrigger.create({
    trigger: refs.heroSection,
    start: "top top",
    // Scrub over 1.5× the hero height
    end: () => `+=${refs.heroSection.offsetHeight * 1.5}`,
    scrub: 1.2,
    onUpdate: (self) => {
      console.log("On Update");
      const p = self.progress; // 0 → 1

      gsap.set(refs.heroSection, {
        // Tilt backward — max 12° (restrained, not dramatic)
        rotationX: p * 75,
        // Scale down very slightly as it tilts
        scale: 1 - p * 0.06,
        // Push down and away
        y: p * 60,
        transformOrigin: "50% 100%",
        transformPerspective: 1000,
      });
    },
  });

  return () => st.kill();
}

// ---------------------------------------------------------------------------
// Scroll tilt animation
// The gallery panel gently tilts fowraed and moves above the previous section.
// Returns a cleanup function that kills the ScrollTrigger instance.
// ---------------------------------------------------------------------------
export function createGalleryScrollAnimation(
  refs: GalleryScrollRefs
): () => void {
  if (prefersReducedMotion()) {
    return () => { };
  }

  // Add perspective on the wrapper so rotationX works in 3-D space
  gsap.set(refs.perspectiveWrapper, {
    perspective: 1000,
    transformStyle: "preserve-3d",
  });

  const st = ScrollTrigger.create({
    trigger: refs.gallerySection,
    start: "top bottom",
    end: "top top",
    scrub: 1.2,
    onUpdate: (self) => {
      const p = self.progress;
      const inv = 1 - p; // reverse the time-mapping: starts tilted, ends flat

      gsap.set(refs.gallerySection, {
        // Tilt forward — starts maxed out, resolves to flat as it settles
        rotationX: -inv * 100,
        // Starts enlarged, settles to natural scale
        scale: 1 + inv * 0.06,
        // Starts pushed up/above, settles down into place
        y: -inv * 60,
        // Hinge from the top edge — opposite of hero's bottom hinge
        transformOrigin: "50% 0%",
        transformPerspective: 1000,
      });
    },
  });

  return () => st.kill();
}

// ---------------------------------------------------------------------------
// Utility: batch-kill all ScrollTrigger instances created by this module.
// Useful if you need a hard reset (e.g. on route change in SPA mode).
// ---------------------------------------------------------------------------
export function killAllHeroTriggers(): void {
  ScrollTrigger.getAll()
    .filter((t) => t.vars.id?.toString().startsWith("hero-"))
    .forEach((t) => t.kill());
}
