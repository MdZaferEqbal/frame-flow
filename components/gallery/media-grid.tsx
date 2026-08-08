import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { MediaItem, MediaType } from "../../lib/types";
import MediaCard from "./media-card";

interface MediaGridProps {
  items: MediaItem[];
  mediaType: MediaType;
  onItemSelect: (item: MediaItem) => void;
}

export default function MediaGrid({
  items,
  mediaType,
  onItemSelect,
}: MediaGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current || items.length === 0) return;

    // Check if the user has requested reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // Target elements inside the grid container
    const itemsToAnimate = gridRef.current.querySelectorAll(".gallery-item");
    if (itemsToAnimate.length === 0) return;

    const ctx = gsap.context(() => {
      // Clear previous animations if any
      gsap.killTweensOf(itemsToAnimate);
      
      // Animate with slide-up and fade-in stagger
      gsap.fromTo(
        itemsToAnimate,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: {
            amount: 0.4, // Stagger duration across all elements
            grid: "auto",
          },
          ease: "power2.out",
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [items, mediaType]);

  if (mediaType === "photos") {
    return (
      <div
        ref={gridRef}
        id="gallery-grid"
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 w-full"
        role="tabpanel"
        aria-labelledby="tab-photos"
      >
        {items.map((item) => (
          <div key={item.id} className="gallery-item opacity-0 break-inside-avoid">
            <MediaCard item={item} onClick={() => onItemSelect(item)} />
          </div>
        ))}
      </div>
    );
  }

  // Videos grid layout
  return (
    <div
      ref={gridRef}
      id="gallery-grid"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"
      role="tabpanel"
      aria-labelledby="tab-videos"
    >
      {items.map((item) => (
        <div key={item.id} className="gallery-item opacity-0">
          <MediaCard item={item} onClick={() => onItemSelect(item)} />
        </div>
      ))}
    </div>
  );
}
