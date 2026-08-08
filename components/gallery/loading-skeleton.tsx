import React from "react";
import { MediaType } from "../../lib/types";

interface LoadingSkeletonProps {
  mediaType: MediaType;
  count?: number;
}

export default function LoadingSkeleton({
  mediaType,
  count = 8,
}: LoadingSkeletonProps) {
  // Pre-determined heights for photos to mock a masonry feel
  const photoHeights = [
    "h-64",
    "h-80",
    "h-96",
    "h-72",
    "h-80",
    "h-64",
    "h-96",
    "h-72",
  ];

  if (mediaType === "photos") {
    return (
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 w-full">
        {Array.from({ length: count }).map((_, index) => {
          const height = photoHeights[index % photoHeights.length];
          return (
            <div
              key={index}
              className={`break-inside-avoid w-full rounded-2xl bg-zinc-100 dark:bg-zinc-900 ${height} animate-pulse relative overflow-hidden`}
              style={{ contentVisibility: "auto" }}
            >
              {/* Overlay shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/20 to-transparent dark:via-zinc-800/10 -translate-x-full animate-[shimmer_1.5s_infinite]" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Videos Grid Skeleton
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden flex flex-col h-full animate-pulse"
        >
          <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/20 to-transparent dark:via-zinc-800/10 -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
          <div className="p-4 flex-1 space-y-3">
            <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
