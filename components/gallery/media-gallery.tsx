"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { MediaSDK } from "@media-core";
import { MediaProvider, useMediaSDK } from "@media-react";
import { useHeadlessGrid } from "@media-ui-react";
import { useMediaGallery } from "../../hooks/use-media-gallery";
import { MediaItem } from "../../lib/types";
import SearchBar from "./search-bar";
import GalleryTabs from "./gallery-tabs";
import MediaGrid from "./media-grid";
import LoadMoreButton from "./load-more-button";
import LoadingSkeleton from "./loading-skeleton";
import EmptyState from "./empty-state";
import ErrorState from "./error-state";
import MediaModal from "./media-modal";
import ReelsSwiper from "./reels-swiper";

function MediaGalleryContent() {
  const sdk = useMediaSDK();
  const {
    items,
    mediaType,
    query,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    setMediaType,
    setQuery,
    loadMore,
    retry,
    clearSearch,
  } = useMediaGallery();

  // Selected media state for the lightbox/modal
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Video view mode: "grid" or "reels"
  const [videoViewMode, setVideoViewMode] = useState<"grid" | "reels">("grid");

  const handleOpenModal = (item: MediaItem) => {
    sdk.trackView(item); // Track the view event on the SDK
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Keep item populated until modal animations close to prevent empty display
    setTimeout(() => {
      setSelectedItem(null);
    }, 300);
  };

  // Connect headless grid hook
  const { getGridProps } = useHeadlessGrid({
    itemsCount: items.length,
    label: mediaType === "photos" ? "Photos grid" : "Videos grid",
  });

  return (
    <div className="w-full">
      {/* Controls & Search Wrapper */}
      <div className="space-y-6 max-w-4xl mx-auto mb-10">
        <SearchBar key={query} initialValue={query} onSearch={setQuery} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <GalleryTabs activeTab={mediaType} onChange={setMediaType} />

          {/* Video view mode toggle buttons */}
          {mediaType === "videos" && items.length > 0 && (
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm shrink-0">
              <button
                onClick={() => setVideoViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  videoViewMode === "grid"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setVideoViewMode("reels")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  videoViewMode === "reels"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Reels
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Dynamic Workspace Area */}
      <main className="min-h-100">
        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : isLoading ? (
          <LoadingSkeleton mediaType={mediaType} count={12} />
        ) : items.length === 0 ? (
          <EmptyState query={query} onClear={clearSearch} />
        ) : (
          <>
            {mediaType === "videos" && videoViewMode === "reels" ? (
              <ReelsSwiper items={items} />
            ) : (
              <div {...getGridProps()}>
                <MediaGrid
                  items={items}
                  mediaType={mediaType}
                  onItemSelect={handleOpenModal}
                />
              </div>
            )}
            
            {/* Show load more button only when not in reels mode or if photos */}
            {(mediaType === "photos" || videoViewMode === "grid") && (
              <LoadMoreButton
                onClick={loadMore}
                isLoading={isLoadingMore}
                hasMore={hasMore}
              />
            )}
          </>
        )}
      </main>

      {/* Lightbox Dialog portal */}
      <MediaModal
        isOpen={isModalOpen}
        item={selectedItem}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default function MediaGallery() {
  // Instantiate the client-side SDK single instance reference
  const sdkRef = useRef<MediaSDK | null>(null);
  if (!sdkRef.current) {
    sdkRef.current = new MediaSDK({ baseUrl: "/api/pexels" });
  }

  return (
    <MediaProvider sdk={sdkRef.current}>
      <MediaGalleryContent />
    </MediaProvider>
  );
}
