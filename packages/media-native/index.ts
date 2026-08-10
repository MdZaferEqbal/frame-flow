import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { MediaSDK, MediaItem, MediaType, ApiResponse } from "../media-core";

const MediaSDKContext = createContext<MediaSDK | null>(null);

export interface MediaProviderProps {
  sdk: MediaSDK;
  children: React.ReactNode;
}

export function MediaProvider({ sdk, children }: MediaProviderProps) {
  return React.createElement(MediaSDKContext.Provider, { value: sdk }, children);
}

export function useMediaSDK(): MediaSDK {
  const sdk = useContext(MediaSDKContext);
  if (!sdk) {
    throw new Error("useMediaSDK must be used within a MediaProvider");
  }
  return sdk;
}

export function useMediaGalleryState() {
  const sdk = useMediaSDK();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [mediaType, setMediaTypeState] = useState<MediaType>("photos");
  const [query, setQueryState] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMedia = useCallback(async (
    type: MediaType,
    searchQuery: string,
    pageNum: number,
    isLoadMore: boolean,
    signal: AbortSignal
  ) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      let data: ApiResponse;

      if (type === "photos") {
        if (searchQuery.trim()) {
          data = await sdk.searchPhotos(searchQuery, pageNum, 20);
        } else {
          data = await sdk.getCuratedPhotos(pageNum, 20);
        }
      } else {
        if (searchQuery.trim()) {
          data = await sdk.searchVideos(searchQuery, pageNum, 20);
        } else {
          data = await sdk.getPopularVideos(pageNum, 20);
        }
      }

      if (signal.aborted) return;

      setItems((prev) => (isLoadMore ? [...prev, ...data.items] : data.items));
      setHasMore(data.hasMore);
    } catch (err: unknown) {
      if (signal.aborted) return;
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      if (signal.aborted) return;
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [sdk]);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(() => {
      fetchMedia(mediaType, query, page, page > 1, controller.signal);
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [mediaType, query, page, fetchMedia]);

  const setMediaType = useCallback((type: MediaType) => {
    setMediaTypeState(type);
    setPage(1);
    setItems([]);
    setHasMore(false);
  }, []);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    setPage(1);
    setItems([]);
    setHasMore(false);
  }, []);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;
    setPage((prev) => prev + 1);
  }, [isLoading, isLoadingMore, hasMore]);

  const retry = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchMedia(mediaType, query, page, page > 1, controller.signal);
  }, [mediaType, query, page, fetchMedia]);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, [setQuery]);

  return {
    items,
    mediaType,
    query,
    page,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    setMediaType,
    setQuery,
    loadMore,
    retry,
    clearSearch,
  };
}
export * from "../media-core";
