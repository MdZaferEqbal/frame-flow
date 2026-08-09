"use client";

import React, { useRef, useLayoutEffect, useEffect } from "react";
import HeroMedia from "./hero-media";
import HeroContent from "./hero-content";
import type { HeroContentRefs } from "./hero-content";
import {
  createHeroIntroAnimation,
  createHeroScrollAnimation,
} from "../../lib/animations/hero-animations";

interface HeroSectionProps {
  /** Forwarded ref to the <header> element for the intro animation */
  headerRef: React.RefObject<HTMLElement | null>;
}

/**
 * HeroSection
 *
 * Assembles HeroMedia + HeroContent, owns all GSAP setup,
 * and wraps everything in the perspective container needed for the
 * scroll-tilt effect.
 *
 * The header ref is received as a prop so the intro animation can
 * coordinate the header's fade-in with the hero's entrance.
 */
export default function HeroSection({ headerRef }: HeroSectionProps) {
  // Refs for GSAP targets
  const wrapperRef = useRef<HTMLDivElement>(null);
  const perspectiveRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRefsRef = useRef<HeroContentRefs>({
    heading: null,
    bodyRight: null,
    bodyLeft: null,
    badge: null,
  });

  const handleContentRefs = (refs: HeroContentRefs) => {
    contentRefsRef.current = refs;
  };

  // useLayoutEffect avoids a flash by running synchronously after DOM paint
  useLayoutEffect(() => {
    // Guard against missing refs
    if (
      !wrapperRef.current ||
      !sectionRef.current ||
      !perspectiveRef.current ||
      !imageRef.current ||
      !headerRef.current ||
      !contentRefsRef.current.heading ||
      !contentRefsRef.current.bodyRight ||
      !contentRefsRef.current.bodyLeft
    ) {
      return;
    }

    // Intro animation
    const introCtx = createHeroIntroAnimation({
      wrapper: wrapperRef.current,
      header: headerRef.current,
      heading: contentRefsRef.current.heading,
      bodyRight: contentRefsRef.current.bodyRight,
      bodyLeft: contentRefsRef.current.bodyLeft,
      image: imageRef.current,
      badge: contentRefsRef.current.badge,
    });

    return () => {
      introCtx.revert();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!sectionRef.current || !perspectiveRef.current) {
      return;
    }

    // Scroll tilt effect
    const cleanupScroll = createHeroScrollAnimation({
      heroSection: sectionRef.current,
      perspectiveWrapper: perspectiveRef.current,
    });

    return () => {
      cleanupScroll();
    };
  }, [])

  return (
    /* Perspective wrapper — provides the 3-D context for the tilt */
    <div ref={perspectiveRef} className="hero-perspective-wrapper relative">
      {/* Hero section — z-10 so the next section (z-20) can cover it */}
      <section
        ref={sectionRef}
        aria-label="Hero — Discover Visual Stories"
        className="relative z-10 min-h-screen w-full overflow-hidden"
      >
        <div ref={wrapperRef} className="relative h-screen w-full">
          {/* Full-bleed background image */}
          <HeroMedia ref={imageRef} />

          {/* Overlaid text content */}
          <HeroContent onRefs={handleContentRefs} />
        </div>
      </section>
    </div>
  );
}
