import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import gsap from "gsap";
import { MediaItem } from "../../lib/types";

interface MediaModalProps {
  isOpen: boolean;
  item: MediaItem | null;
  onClose: () => void;
}

export default function MediaModal({ isOpen, item, onClose }: MediaModalProps) {
  const [mounted, setMounted] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Handle client-side portal mounting
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  // Save the currently focused element on open, and restore it on close
  useEffect(() => {
    if (isOpen) {
      lastActiveElementRef.current = document.activeElement as HTMLElement;
    } else {
      lastActiveElementRef.current?.focus();
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // GSAP animations for opening modal
  useEffect(() => {
    if (!isOpen || !mounted) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Fade in the black backdrop overlay
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      // Scale up and fade in the dialog container content
      gsap.fromTo(
        contentRef.current,
        { scale: 0.96, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.35,
          delay: 0.05,
          ease: "power3.out",
        }
      );
    });

    return () => ctx.revert();
  }, [isOpen, mounted]);

  // Escape key close & Focus Trap listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll(
          'a[href], button, video, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;

        if (focusable.length === 0) return;

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

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Put focus inside the modal on load
      setTimeout(() => {
        const firstFocus = contentRef.current?.querySelector(
          "button, a, video"
        ) as HTMLElement;
        firstFocus?.focus();
      }, 100);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !item) return null;

  const isVideo = item.type === "video";
  const authorName = isVideo ? item.user.name : item.photographer;
  const authorUrl = isVideo ? item.user.url : item.photographerUrl;

  // Resolve best video playback URL
  const getPlaybackUrl = () => {
    if (!isVideo) return "";
    const files = item.videoFiles;
    // Prefer HD mp4 files for crisp playbacks
    let match = files.find(
      (f) => f.fileType === "video/mp4" && f.quality === "hd"
    );
    if (!match) {
      match = files.find((f) => f.fileType === "video/mp4");
    }
    if (!match) {
      match = files[0];
    }
    return match?.link || "";
  };

  const videoSrc = getPlaybackUrl();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-200"
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Media Container */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden min-h-[300px] max-h-[70vh]">
          {isVideo ? (
            <video
              src={videoSrc}
              poster={item.image}
              controls
              autoPlay
              className="w-full h-full max-h-[70vh] object-contain"
              aria-label={`Video player for content by ${authorName}`}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center">
              <Image
                src={item.src.original}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                priority
                unoptimized // High resolution photo link from CDN
              />
            </div>
          )}
        </div>

        {/* Info/Metadata Footer */}
        <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-base font-semibold text-zinc-900 dark:text-zinc-50 truncate"
            >
              {isVideo ? "Video Clip" : item.alt || "Pexels Photo"}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                Created by:
              </span>
              {authorUrl ? (
                <a
                  href={authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 underline decoration-dotted transition-colors duration-150"
                >
                  {authorName}
                </a>
              ) : (
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                  {authorName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-950 dark:focus:ring-offset-zinc-950 shadow-sm"
            >
              <span>View source page</span>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
