"use client";

import React, { useState } from "react";
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

export default function MediaGallery() {
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

  const handleOpenModal = (item: MediaItem) => {
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

  return (
    <div className="w-full">
      {/* Controls & Search Wrapper */}
      <div className="space-y-6 max-w-4xl mx-auto mb-10">
        <SearchBar key={query} initialValue={query} onSearch={setQuery} />
        <GalleryTabs activeTab={mediaType} onChange={setMediaType} />
      </div>

      {/* Main Dynamic Workspace Area */}
      <main className="min-h-[400px]">
        {error ? (
          <ErrorState error={error} onRetry={retry} />
        ) : isLoading ? (
          <LoadingSkeleton mediaType={mediaType} count={12} />
        ) : items.length === 0 ? (
          <EmptyState query={query} onClear={clearSearch} />
        ) : (
          <>
            <MediaGrid
              items={items}
              mediaType={mediaType}
              onItemSelect={handleOpenModal}
            />
            <LoadMoreButton
              onClick={loadMore}
              isLoading={isLoadingMore}
              hasMore={hasMore}
            />
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
