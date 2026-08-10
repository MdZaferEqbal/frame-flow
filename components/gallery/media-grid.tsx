import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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

  // --- Scroll-to-gallery-top button ---
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Mark mounted for portal rendering
  useEffect(() => { setIsMounted(true); }, []);

  const scrollToGallery = useCallback(() => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const THRESHOLD = 600; // px below the #gallery top

    const handleScroll = () => {
      const gallery = document.getElementById("gallery");
      if (!gallery) return;
      const galleryTop = gallery.getBoundingClientRect().top + window.scrollY;
      const distancePast = window.scrollY - galleryTop;
      setShowScrollBtn(distancePast > THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animate the button in/out with GSAP
  useEffect(() => {
    if (!btnRef.current) return;
    if (showScrollBtn) {
      gsap.fromTo(
        btnRef.current,
        { opacity: 0, y: 12, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
      );
    } else {
      gsap.to(btnRef.current, {
        opacity: 0,
        y: 12,
        scale: 0.85,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [showScrollBtn]);

  // Portalled to document.body so it truly floats above everything,
  // including any overflow:hidden parent containers
  const scrollBtn = isMounted ? createPortal(
    <button
      ref={btnRef}
      onClick={scrollToGallery}
      aria-label="Back to top of gallery"
      title="Back to top of gallery"
      style={{ opacity: 0 }} // hidden initially; GSAP animates it in
      className="
        fixed bottom-6 right-6 z-[9999]
        flex items-center gap-1.5
        rounded-full
        bg-zinc-900/80 dark:bg-zinc-100/90
        text-zinc-50 dark:text-zinc-900
        backdrop-blur-md
        border border-zinc-700/40 dark:border-zinc-300/30
        shadow-lg
        px-3.5 py-2
        text-xs font-semibold tracking-wide
        transition-colors
        hover:bg-zinc-800 dark:hover:bg-white
        active:scale-95
        cursor-pointer
      "
    >
      {/* Up arrow icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-3.5 h-3.5"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04L10.75 5.612V16.25A.75.75 0 0 1 10 17Z"
          clipRule="evenodd"
        />
      </svg>
      Gallery Top
    </button>,
    document.body
  ) : null;

  if (mediaType === "photos") {
    return (
      <>
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
        {scrollBtn}
      </>
    );
  }

  // Videos grid layout
  return (
    <>
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
      {scrollBtn}
    </>
  );
}
