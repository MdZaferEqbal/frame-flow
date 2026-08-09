"use client";

import Image from "next/image";
import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";

export interface HeroContentRefs {
  heading: HTMLElement | null;
  bodyRight: HTMLElement | null;
  bodyLeft: HTMLElement | null;
  badge: HTMLElement | null;
}

interface HeroContentProps {
  /** Callback to expose internal element refs to parent for GSAP */
  onRefs?: (refs: HeroContentRefs) => void;
}

/**
 * HeroContent
 *
 * Renders the overlaid text content on the hero section:
 * - Oversized display heading (three lines)
 * - Two supporting body-text blocks
 * - Year badge at bottom-left
 *
 * All interactive/textual content is semantically structured and readable
 * without animations (reduced-motion safe).
 */
const HeroContent = forwardRef<HeroContentRefs, HeroContentProps>(
  ({ onRefs }, ref) => {
    const headingRef = useRef<HTMLHeadingElement>(null);
    const bodyRightRef = useRef<HTMLParagraphElement>(null);
    const bodyLeftRef = useRef<HTMLParagraphElement>(null);
    const badgeRef = useRef<HTMLSpanElement>(null);

    // Expose refs to the parent via the forwarded ref handle
    useImperativeHandle(ref, () => ({
      heading: headingRef.current,
      bodyRight: bodyRightRef.current,
      bodyLeft: bodyLeftRef.current,
      badge: badgeRef.current,
    }));

    // Also fire the onRefs callback on first render (used for direct ref access)
    React.useEffect(() => {
      onRefs?.({
        heading: headingRef.current,
        bodyRight: bodyRightRef.current,
        bodyLeft: bodyLeftRef.current,
        badge: badgeRef.current,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Scroll vs Swipe label detection ────────────────────────────────────
    // Default to 'Scroll' on the server so SSR output matches the initial
    // client render. After hydration we read the real device capabilities.
    const [discoverLabel, setDiscoverLabel] = useState<"scroll" | "swipe">("scroll");

    useEffect(() => {
      const isTouchDevice =
        window.matchMedia("(pointer: coarse)").matches ||
        navigator.maxTouchPoints > 0;
      // small / medium = viewport narrower than 1024px (lg breakpoint)
      const isSmallOrMedium = window.matchMedia("(max-width: 1023px)").matches;

      if (isTouchDevice && isSmallOrMedium) {
        setDiscoverLabel("swipe");
      }
    }, []);

    return (
      <>
        <Image src="/hero-bg-mother-holding-child.png" alt="" width={1000} height={1000} className="w-full h-full object-cover absolute z-30 opacity-25 hover:opacity-100 transition-all duration-300" />
        <div className="relative z-10 flex flex-col justify-between h-full px-5 sm:px-8 md:px-12 lg:px-16 pt-20 pb-8 md:pb-12">
          {/*
          Top-right: short teaser copy — positioned absolute on md+ to mirror
          the reference image layout where the first text floats mid-right.
        */}
          <p
            ref={bodyRightRef}
            className="
            hidden md:block
            absolute top-[28%] right-8 lg:right-14
            max-w-[220px] lg:max-w-[260px]
            text-white/80 text-xs leading-relaxed
            font-light tracking-wide
          "
            aria-label="Gallery description"
          >
            Curated in the heart of the visual web, Frame Flow stands as a timeless
            tribute to the rich diversity and artistry of global creators.
          </p>

          {/* Display heading — oversized, left-aligned, spanning three lines */}
          <div className="mt-[50vh] md:mt-auto h-full md:h-auto">
            <h1
              ref={headingRef}
              className="
              hero-display-heading
              font-serif
              text-white
              leading-[0.88]
              tracking-tight
              select-none
              pointer-events-none
            "
              style={{
                fontSize: "clamp(4rem, 11vw, 9rem)",
                textShadow: "0 2px 40px rgba(0,0,0,0.3)",
              }}
            >
              <span className="block pl-[8%]">DISCOVER</span>
              <span className="block">VISUAL</span>
              <span className="block pl-[8%]">STORIES</span>
            </h1>

            {/*
            Bottom row: year badge on the left, second copy block in the centre/right.
            Mirrors the reference layout.
          */}
            <div className="flex items-end justify-between mt-6 md:mt-8">
              {/* <span
              ref={badgeRef}
              className="text-white/60 text-sm font-light tracking-widest"
              aria-label="Year"
            >
              {new Date().getFullYear()}
            </span> */}

              <p
                ref={bodyLeftRef}
                className="
                hidden md:block
                max-w-[260px] sm:max-w-[320px]
                text-white/75 text-xs sm:text-sm leading-relaxed
                font-light tracking-wide text-right
              "
              >
                Frame Flow is more than just a media repository. It is a sanctuary
                where past and present converge through the lens of global creators.
              </p>
            </div>
          </div>

          {/* ── Scroll / Swipe to Discover indicator ───────────────────────── */}
          <div
            aria-label={discoverLabel === "swipe" ? "Swipe up to discover" : "Scroll to discover"}
            className="
            absolute bottom-8 left-1/2 -translate-x-1/2
            flex flex-col items-center gap-2
            pointer-events-none select-none
          "
          >
            {discoverLabel === "swipe" ? (
              // ── Touch / mobile: horizontal swipe hand with up-arrow ────────
              <>
                <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-light">
                  Swipe to discover
                </span>
                {/* Animated swipe chevrons */}
                <div className="flex flex-col items-center gap-0.5 hero-swipe-icon">
                  <svg
                    className="w-5 h-5 text-white/40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <svg
                    className="w-5 h-5 text-white/25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </div>
              </>
            ) : (
              // ── Desktop: classic scroll mouse indicator ────────────────────
              <>
                <div
                  aria-hidden="true"
                  className="
                  w-[22px] h-[36px] rounded-full
                  border border-white/30
                  flex items-start justify-center
                  pt-[6px]
                "
                >
                  {/* Animated scroll dot */}
                  <div className="w-[3px] h-[7px] rounded-full bg-white/60 hero-scroll-dot" />
                </div>
                <span className="text-white/50 text-[10px] tracking-[0.2em] uppercase font-light">
                  Scroll to discover
                </span>
              </>
            )}
          </div>
        </div>
      </>
    );
  }
);

HeroContent.displayName = "HeroContent";

export default HeroContent;
