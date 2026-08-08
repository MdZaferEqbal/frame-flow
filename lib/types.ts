export interface PhotoItem {
  id: number;
  type: "photo";
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographerUrl: string;
  avgColor: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

export interface VideoFile {
  id: number;
  quality: "hd" | "sd";
  fileType: string;
  width: number;
  height: number;
  link: string;
}

export interface VideoItem {
  id: number;
  type: "video";
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  videoFiles: VideoFile[];
}

export type MediaItem = PhotoItem | VideoItem;

export interface ApiResponse {
  items: MediaItem[];
  page: number;
  perPage: number;
  totalResults: number;
  hasMore: boolean;
}

export type MediaType = "photos" | "videos";

export interface GalleryState {
  items: MediaItem[];
  mediaType: MediaType;
  query: string;
  page: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
}
