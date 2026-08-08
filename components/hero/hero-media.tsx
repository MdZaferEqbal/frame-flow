"use client";

import React, { forwardRef } from "react";
import Image from "next/image";

interface HeroMediaProps {
  /** Alt text for the background image */
  alt?: string;
}

/**
 * HeroMedia
 *
 * Full-bleed background image layer for the hero section.
 * The ref is forwarded to the wrapping div so GSAP can target it directly.
 */
const HeroMedia = forwardRef<HTMLDivElement, HeroMediaProps>(
  ({ alt = "A warm, richly-lit classical art studio interior" }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className="hero-image-layer absolute inset-0 overflow-hidden"
      >
        {/* The background image */}
        <Image
          src="/hero-bg.jpg"
          alt={alt}
          fill
          priority
          quality={80}
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Gradient overlay: darkens edges and bottom for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.18) 70%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>
    );
  }
);

HeroMedia.displayName = "HeroMedia";

export default HeroMedia;
