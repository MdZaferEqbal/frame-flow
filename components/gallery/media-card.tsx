import React from "react";
import Image from "next/image";
import { MediaItem } from "../../lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
}

export default function MediaCard({ item, onClick }: MediaCardProps) {
  const isVideo = item.type === "video";
  const author = isVideo ? item.user.name : item.photographer;
  const imageUrl = isVideo ? item.image : item.src.large;
  const altText = isVideo ? `Video by ${author}` : item.alt;

  // Format video duration (e.g. 72s -> "1:12")
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  if (isVideo) {
    return (
      <div
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Play video by ${author}, duration ${formatDuration(item.duration)}`}
        className="group relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 shadow-sm cursor-pointer aspect-video flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-offset-zinc-950 dark:focus-visible:ring-zinc-50 transition-all duration-300 hover:shadow-md"
      >
        {/* Poster Image */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={altText}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-zinc-600">
            No Preview Available
          </div>
        )}

        {/* Video Duration Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/75 backdrop-blur-md rounded-md text-[10px] font-bold text-zinc-100 uppercase tracking-wide">
          {formatDuration(item.duration)}
        </div>

        {/* Glassmorphism Bottom Bar & Play Icon Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
          {/* Top space */}
          <div />

          {/* Centered Play Button (Micro-animation on Hover) */}
          <div className="mx-auto p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg transition-transform duration-300 scale-90 group-hover:scale-100 group-hover:bg-white/30">
            <FontAwesomeIcon icon={faPlay} />
          </div>

          {/* Bottom Info bar */}
          <div className="flex items-center justify-between text-white mt-2">
            <div className="min-w-0 pr-2">
              <p className="text-xs text-zinc-400 font-medium">Video Creator</p>
              <p className="text-sm font-semibold truncate text-zinc-100">
                {author}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-300 shrink-0">
              <span>Play</span>
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Photo Item
  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View photo by ${author}. Alt: ${item.alt}`}
      className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 shadow-sm cursor-pointer mb-4 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-offset-zinc-950 dark:focus-visible:ring-zinc-50 transition-all duration-300 hover:shadow-md"
      style={{ contentVisibility: "auto" }}
    >
      <div className="relative w-full h-auto overflow-hidden">
        <Image
          src={imageUrl}
          alt={altText}
          width={item.width}
          height={item.height}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-102"
        />
      </div>

      {/* Hover Information Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="flex items-center justify-between text-white">
          <div className="min-w-0 pr-2">
            <p className="text-xs text-zinc-400 font-medium">Photographer</p>
            <p className="text-sm font-semibold truncate text-zinc-100">
              {author}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile/Fallback Metadata (Visible when overlay is hidden on mobile devices/no hover) */}
      <div className="p-3.5 bg-white dark:bg-zinc-950 sm:hidden flex flex-col border-t border-zinc-100 dark:border-zinc-900/50">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
          Photographer
        </p>
        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
          {author}
        </p>
      </div>
    </div>
  );
}
