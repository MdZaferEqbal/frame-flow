"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useHeadlessReelSwiper } from "@media-ui-react";
import { useMediaSDK } from "@media-react";
import { MediaItem, VideoItem } from "../../lib/types";
import gsap from "gsap";

interface ReelsSwiperProps {
  items: MediaItem[];
}

export default function ReelsSwiper({ items }: ReelsSwiperProps) {
  const sdk = useMediaSDK();
  const videos = items.filter((item) => item.type === "video") as VideoItem[];

  const { activeIndex, registerSlide, getContainerProps, getSlideProps, scrollToSlide } =
    useHeadlessReelSwiper({
      itemsCount: videos.length,
      onIndexChange: (index) => {
        const item = videos[index];
        if (item) sdk.trackView(item);
      },
    });

  // Track view of the first reel on mount
  useEffect(() => {
    if (videos[0]) sdk.trackView(videos[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/80">
        <p className="text-zinc-500 dark:text-zinc-400">No videos available for Reels view</p>
      </div>
    );
  }

  const containerProps = getContainerProps();

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Scrollable Reel Container — fixed viewport height, centered */}
      <div
        ref={containerProps.ref}
        className="no-scrollbar"
        style={{
          ...containerProps.style,
          height: "640px",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
        }}
      >
        {videos.map((video, index) => {
          const isActive = index === activeIndex;
          const slideProps = getSlideProps(index);
          return (
            <div
              key={video.id}
              ref={registerSlide(index)}
              {...slideProps}
              style={{
                ...slideProps.style,
                height: "600px",
                width: "100%",
                marginTop: index === 0 ? "20px" : "0px",
                marginBottom: "20px",
                borderRadius: "20px",
                overflow: "hidden",
                flexShrink: 0,
                scrollSnapAlign: "center",
              }}
              className="relative bg-black shadow-2xl border border-zinc-800/60"
            >
              <ReelPlayer video={video} isActive={isActive} sdk={sdk} />
            </div>
          );
        })}
        {/* Bottom padding so last reel can scroll to center */}
        <div style={{ height: "20px", flexShrink: 0 }} />
      </div>

      {/* Progress dots — right side, vertically centered */}
      {videos.length > 1 && (
        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSlide(index)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                index === activeIndex
                  ? "w-2 h-5 bg-white shadow-md"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to reel ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReelPlayerProps {
  video: VideoItem;
  isActive: boolean;
  sdk: any;
}

function ReelPlayer({ video, isActive, sdk }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hudIcon, setHudIcon] = useState<"play" | "pause">("play");

  // ── Auto-play when this reel is the active (visible) one ──
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (isActive) {
      vid.currentTime = 0;
      vid.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      vid.pause();
      vid.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const getPlaybackUrl = () => {
    const files = video.videoFiles;
    const hd = files.find((f) => f.fileType === "video/mp4" && f.quality === "hd");
    if (hd) return hd.link;
    const sd = files.find((f) => f.fileType === "video/mp4");
    return sd?.link || files[0]?.link || "";
  };

  const videoSrc = getPlaybackUrl();

  // ── Animate the HUD pop icon (play / pause) ──
  const flashHud = useCallback((icon: "play" | "pause") => {
    setHudIcon(icon);
    if (!hudRef.current) return;
    gsap.killTweensOf(hudRef.current);
    gsap.fromTo(
      hudRef.current,
      { scale: 0.5, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.18,
        ease: "back.out(2)",
        onComplete: () => {
          gsap.to(hudRef.current, { opacity: 0, scale: 1.15, duration: 0.22, delay: 0.3 });
        },
      }
    );
  }, []);

  // ── Single click → toggle play/pause ──
  const handleClick = useCallback(() => {
    const vid = videoRef.current;
    if (!vid || !isActive) return;

    if (isPlaying) {
      vid.pause();
      setIsPlaying(false);
      flashHud("pause");
    } else {
      vid.play().catch(() => {});
      setIsPlaying(true);
      flashHud("play");
    }
  }, [isPlaying, isActive, flashHud]);

  // ── Double-click → heart animation + track interaction ──
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    sdk.trackView(video);

    if (!heartRef.current) return;
    gsap.killTweensOf(heartRef.current);
    gsap.fromTo(
      heartRef.current,
      { scale: 0, opacity: 0 },
      {
        scale: 1.25,
        opacity: 1,
        duration: 0.28,
        ease: "back.out(1.7)",
        onComplete: () => {
          gsap.to(heartRef.current, { opacity: 0, scale: 0.9, duration: 0.3, delay: 0.25 });
        },
      }
    );
  }, [sdk, video]);

  // ── Mute button ──
  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    const next = !isMuted;
    vid.muted = next;
    setIsMuted(next);
  }, [isMuted]);

  const handleDownload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    sdk.trackDownload(video);
    window.open(videoSrc, "_blank");
  }, [sdk, video, videoSrc]);

  return (
    <div
      className="relative w-full h-full cursor-pointer select-none"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={video.image}
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Double-tap heart pop */}
      <div
        ref={heartRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 z-30"
      >
        <svg className="w-24 h-24 text-red-500 drop-shadow-2xl fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {/* Play / Pause HUD icon */}
      <div
        ref={hudRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 z-30"
      >
        <div className="p-5 rounded-full bg-black/60 backdrop-blur-sm text-white shadow-xl">
          {hudIcon === "play" ? (
            <svg className="w-10 h-10 fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </div>
      </div>

      {/* Mute button — top right */}
      <button
        onClick={toggleMute}
        className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/10 transition-all duration-150 pointer-events-auto cursor-pointer"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        )}
      </button>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none z-10" />

      {/* Bottom info + actions */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5 pointer-events-none">
        {/* Creator info */}
        <div className="pointer-events-auto mb-3">
          <p className="text-white font-semibold text-sm leading-tight">
            {video.user.name}
          </p>
          <p className="text-zinc-400 text-xs mt-0.5">Video Clip #{video.id}</p>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 hover:bg-white text-zinc-900 text-xs font-bold rounded-full transition-all duration-150 cursor-pointer shadow-md"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>

          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-600/40 text-white text-xs font-bold rounded-full transition-all duration-150 shadow-md"
          >
            View source
          </a>
        </div>
      </div>
    </div>
  );
}
