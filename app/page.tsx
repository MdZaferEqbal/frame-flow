"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import MediaGallery from "../components/gallery/media-gallery";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const heroRef = useRef<HTMLDivElement>(null);

  // Sync theme with document class list
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    const timer = setTimeout(() => {
      setTheme(initialTheme);
      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  // GSAP Entrance Animations
  useEffect(() => {
    if (!heroRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      // If user prefers reduced motion, make sure elements are fully visible without transitions
      gsap.set(
        [
          ".animate-header",
          ".animate-title",
          ".animate-subtitle",
          ".animate-gallery",
        ],
        { opacity: 1, y: 0 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      // Header fades in and slides down slightly
      gsap.fromTo(
        ".animate-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      // Hero content slides up and fades in with a stagger sequence
      gsap.fromTo(
        [".animate-title", ".animate-subtitle", ".animate-gallery"],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header Bar */}
      <header className="animate-header opacity-0 sticky top-0 z-40 w-full border-b border-zinc-200/60 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-black text-lg transition-transform duration-200 hover:rotate-12 shadow-sm">
              🦉
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Foto Owl
              </span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium">
                Visual media gallery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 shadow-sm"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m2.828 9.9a5 5 0 117.071-7.071 5 5 0 01-7.071 7.071z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col gap-12">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
          <h1 className="animate-title opacity-0 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-zinc-950 dark:text-zinc-50">
            Discover visual stories
          </h1>
          <p className="animate-subtitle opacity-0 text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl font-medium leading-relaxed">
            Search and explore stunning, high-resolution photographs and professional video clips sourced directly from global creators.
          </p>
        </section>

        {/* Gallery Module */}
        <section className="animate-gallery opacity-0 w-full">
          <MediaGallery />
        </section>
      </div>

      {/* Footer Section */}
      <footer className="w-full py-8 border-t border-zinc-200/50 dark:border-zinc-900 bg-white dark:bg-zinc-950/20 text-center text-xs text-zinc-400 dark:text-zinc-600 transition-colors duration-300">
        <p>&copy; {new Date().getFullYear()} Foto Owl. All rights reserved. Powered by Pexels API.</p>
      </footer>
    </div>
  );
}
