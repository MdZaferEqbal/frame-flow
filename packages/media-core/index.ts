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

export interface MediaSDKConfig {
  apiKey?: string;
  baseUrl: string;
}

type EventMap = {
  download: (item: MediaItem) => void;
  view: (item: MediaItem) => void;
};

export class EventEmitter {
  private listeners: { [K in keyof EventMap]?: EventMap[K][] } = {};

  on<K extends keyof EventMap>(event: K, listener: EventMap[K]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(listener);
  }

  off<K extends keyof EventMap>(event: K, listener: EventMap[K]): void {
    const list = this.listeners[event];
    if (!list) return;
    this.listeners[event] = list.filter((l) => l !== listener) as EventMap[K][];
  }

  emit<K extends keyof EventMap>(event: K, ...args: Parameters<EventMap[K]>): void {
    const list = this.listeners[event];
    if (!list) return;
    for (const listener of list) {
      try {
        (listener as any)(...args);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    }
  }
}

export class MediaSDK extends EventEmitter {
  private config: MediaSDKConfig;
  private cache = new Map<string, { data: any; expiry: number }>();
  private activeRequests = new Map<string, Promise<any>>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes cache TTL

  constructor(config: MediaSDKConfig) {
    super();
    this.config = config;
    
    // Register default listeners as required by the plan (logs to console)
    this.on("view", (item) => {
      console.log(`[MediaSDK] View event: ${item.type} with ID ${item.id}`);
    });
    this.on("download", (item) => {
      console.log(`[MediaSDK] Download event: ${item.type} with ID ${item.id}`);
    });
  }

  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((k) => `${k}=${encodeURIComponent(params[k])}`)
      .join("&");
    return `${endpoint}?${sortedParams}`;
  }

  private async fetchWithCacheDeDup<T>(
    endpoint: string,
    params: Record<string, any>,
    options?: RequestInit
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);

    // 1. Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }

    // 2. Check Active Requests (De-duplication)
    const active = this.activeRequests.get(cacheKey);
    if (active) {
      return active as Promise<T>;
    }

    // 3. Make Fetch Request
    const url = new URL(this.config.baseUrl, typeof window !== "undefined" ? window.location.origin : undefined);
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, String(params[key]));
    });

    const headers: Record<string, string> = { ...((options?.headers as any) || {}) };
    if (this.config.apiKey) {
      headers["Authorization"] = this.config.apiKey;
    }

    const requestPromise = fetch(url.toString(), {
      ...options,
      headers,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Cache the result
        this.cache.set(cacheKey, {
          data,
          expiry: Date.now() + this.cacheTTL,
        });
        return data;
      })
      .finally(() => {
        this.activeRequests.delete(cacheKey);
      });

    this.activeRequests.set(cacheKey, requestPromise);
    return requestPromise as Promise<T>;
  }

  async searchPhotos(query: string, page = 1, perPage = 20): Promise<ApiResponse> {
    return this.fetchWithCacheDeDup<ApiResponse>("", {
      type: "photos",
      query,
      page,
      per_page: perPage,
    });
  }

  async getCuratedPhotos(page = 1, perPage = 20): Promise<ApiResponse> {
    return this.fetchWithCacheDeDup<ApiResponse>("", {
      type: "photos",
      query: "",
      page,
      per_page: perPage,
    });
  }

  async searchVideos(query: string, page = 1, perPage = 20): Promise<ApiResponse> {
    return this.fetchWithCacheDeDup<ApiResponse>("", {
      type: "videos",
      query,
      page,
      per_page: perPage,
    });
  }

  async getPopularVideos(page = 1, perPage = 20): Promise<ApiResponse> {
    return this.fetchWithCacheDeDup<ApiResponse>("", {
      type: "videos",
      query: "",
      page,
      per_page: perPage,
    });
  }

  async getMediaItem(id: number, type: MediaType): Promise<MediaItem> {
    return this.fetchWithCacheDeDup<MediaItem>("", {
      type,
      id,
    });
  }

  trackView(item: MediaItem): void {
    this.emit("view", item);
  }

  trackDownload(item: MediaItem): void {
    this.emit("download", item);
  }
}
