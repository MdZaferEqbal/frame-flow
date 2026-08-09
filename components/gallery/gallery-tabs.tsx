import React from "react";
import { MediaType } from "../../lib/types";

interface GalleryTabsProps {
  activeTab: MediaType;
  onChange: (tab: MediaType) => void;
}

export default function GalleryTabs({ activeTab, onChange }: GalleryTabsProps) {
  return (
    <div className="flex justify-center my-6" role="tablist" aria-label="Media Type Selector">
      <div className="relative flex p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-inner">
        {/* Sliding active pill indicator */}
        <div
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-9px)] bg-white dark:bg-zinc-800 rounded-xl shadow-sm transition-transform duration-300 ease-out-quad ${activeTab === "videos"
            ? "translate-x-[calc(100%+6px)]"
            : "translate-x-0"
            }`}
        />

        <button
          onClick={() => onChange("photos")}
          aria-selected={activeTab === "photos"}
          role="tab"
          id="tab-photos"
          aria-controls="gallery-grid"
          type="button"
          className={`relative z-10 px-8 py-2 text-sm font-semibold rounded-xl transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50 focus:outline-none ${activeTab === "photos"
            ? "text-zinc-900 dark:text-zinc-50"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            }`}
        >
          Photos
        </button>

        <button
          onClick={() => onChange("videos")}
          aria-selected={activeTab === "videos"}
          role="tab"
          id="tab-videos"
          aria-controls="gallery-grid"
          type="button"
          className={`relative z-10 px-8 py-2 text-sm font-semibold rounded-xl transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-50 focus:outline-none ${activeTab === "videos"
            ? "text-zinc-900 dark:text-zinc-50"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            }`}
        >
          Videos
        </button>
      </div>
    </div>
  );
}
