"use client";

import React, { useState, useEffect, useRef } from "react";
import SiteHeader from "../components/header/site-header";
import HeroSection from "../components/hero/hero-section";
import MediaGallery from "../components/gallery/media-gallery";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const headerRef = useRef<HTMLElement>(null);

  // Sync theme with document class list on first mount
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: "light" | "dark" = saved ?? (systemDark ? "dark" : "light");

    const timer = setTimeout(() => {
      setTheme(initial);
      document.documentElement.classList.toggle("dark", initial === "dark");
      document.documentElement.classList.toggle("light", initial === "light");
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const next: "light" | "dark" = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.classList.toggle("light", next === "light");
  };

  return (
    /*
      Outer wrapper:
      - hero-section has z-10
      - gallery section has z-20 so the hero scrolls behind it
    */
    <div className="relative bg-background text-foreground">
      {/* Fixed header — always above everything */}
      <SiteHeader ref={headerRef} theme={theme} onToggleTheme={toggleTheme} />

      {/* Hero — full-screen, z-10 */}
      <HeroSection headerRef={headerRef} />

      {/* Gallery section — z-20, solid background so hero slides behind it */}
      <section
        id="gallery"
        aria-label="Media gallery"
        className="
          relative z-20
          bg-background
          w-full
          px-4 sm:px-6 lg:px-8
          py-16 md:py-20
          flex flex-col gap-4
        "
      >
        {/* Section heading */}
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 mb-2">
            Explore the collection
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10 font-medium">
            Search and explore high-resolution photos and professional video
            clips sourced from global creators.
          </p>
        </div>

        {/* Gallery module */}
        <div className="max-w-7xl mx-auto w-full">
          <MediaGallery />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 w-full py-8 border-t border-zinc-200/50 dark:border-zinc-900 bg-background text-center text-xs text-zinc-400 dark:text-zinc-600 transition-colors duration-300">
        <p>
          &copy; {new Date().getFullYear()} Frame Flow. All rights reserved.
          Powered by Pexels API.
        </p>
      </footer>
    </div>
  );
}
