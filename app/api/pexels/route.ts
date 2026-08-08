import { NextRequest, NextResponse } from "next/server";
import { PhotoItem, VideoItem, ApiResponse } from "../../../lib/types";

interface PexelsPhoto {
  id: number;
  width?: number;
  height?: number;
  url?: string;
  photographer?: string;
  photographer_url?: string;
  avg_color?: string;
  src?: {
    original?: string;
    large2x?: string;
    large?: string;
    medium?: string;
    small?: string;
    portrait?: string;
    landscape?: string;
    tiny?: string;
  };
  alt?: string;
}

interface PexelsVideoFile {
  id: number;
  quality?: string;
  file_type?: string;
  width?: number;
  height?: number;
  link?: string;
}

interface PexelsVideo {
  id: number;
  width?: number;
  height?: number;
  url?: string;
  image?: string;
  duration?: number;
  user?: {
    id?: number;
    name?: string;
    url?: string;
  };
  video_files?: PexelsVideoFile[];
}

// Helper to normalize photo from Pexels format to our custom format
function normalizePhoto(photo: PexelsPhoto): PhotoItem {
  return {
    id: photo.id,
    type: "photo",
    width: photo.width || 0,
    height: photo.height || 0,
    url: photo.url || "",
    photographer: photo.photographer || "Unknown Photographer",
    photographerUrl: photo.photographer_url || "",
    avgColor: photo.avg_color || "#18181b",
    src: {
      original: photo.src?.original || "",
      large2x: photo.src?.large2x || "",
      large: photo.src?.large || "",
      medium: photo.src?.medium || "",
      small: photo.src?.small || "",
      portrait: photo.src?.portrait || "",
      landscape: photo.src?.landscape || "",
      tiny: photo.src?.tiny || "",
    },
    alt: photo.alt || "Pexels Photo",
  };
}

// Helper to normalize video from Pexels format to our custom format
function normalizeVideo(video: PexelsVideo): VideoItem {
  return {
    id: video.id,
    type: "video",
    width: video.width || 0,
    height: video.height || 0,
    url: video.url || "",
    image: video.image || "",
    duration: video.duration || 0,
    user: {
      id: video.user?.id || 0,
      name: video.user?.name || "Unknown Creator",
      url: video.user?.url || "",
    },
    videoFiles: (video.video_files || []).map((file) => ({
      id: file.id,
      quality: (file.quality === "hd" ? "hd" : "sd") as "hd" | "sd",
      fileType: file.file_type || "video/mp4",
      width: file.width || 0,
      height: file.height || 0,
      link: file.link || "",
    })),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "photos";
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "20", 10);

    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey || apiKey === "your_pexels_api_key") {
      return NextResponse.json(
        { 
          error: "PEXELS_API_KEY is not configured on the server. Please add it to your .env.local file." 
        },
        { status: 500 }
      );
    }

    let url = "";
    
    if (type === "photos") {
      if (query.trim()) {
        url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
      } else {
        url = `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`;
      }
    } else if (type === "videos") {
      if (query.trim()) {
        url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
      } else {
        url = `https://api.pexels.com/videos/popular?page=${page}&per_page=${perPage}`;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid media type. Must be 'photos' or 'videos'." },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
      },
      next: { revalidate: 3600 } // Cache results for 1 hour
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid Pexels API Key." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `Pexels API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    let items = [];
    let hasMore = false;

    if (type === "photos") {
      items = (data.photos || []).map(normalizePhoto);
      hasMore = data.next_page ? true : false;
    } else {
      items = (data.videos || []).map(normalizeVideo);
      hasMore = data.next_page ? true : false;
    }

    const apiResponse: ApiResponse = {
      items,
      page,
      perPage,
      totalResults: data.total_results || 0,
      hasMore,
    };

    return NextResponse.json(apiResponse);
  } catch (error: unknown) {
    console.error("Pexels proxy error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred while communicating with Pexels.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
