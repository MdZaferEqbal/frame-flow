import { useState, useEffect, useRef, useCallback } from "react";
import { MediaItem, MediaType, ApiResponse } from "../lib/types";

export function useMediaGallery() {
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
      const res = await fetch(
        `/api/pexels?type=${type}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}&per_page=20`,
        { signal }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch data (status ${res.status})`
        );
      }

      const data: ApiResponse = await res.json();

      setItems((prev) => (isLoadMore ? [...prev, ...data.items] : data.items));
      setHasMore(data.hasMore);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return; // Ignore aborted requests
      }
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Main data fetching controller
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
    setItems([]); // Clear items immediately to prevent visual flashing of stale results
    setHasMore(false);
  }, []);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
    setPage(1);
    setItems([]); // Clear items immediately
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
