"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

interface SiteHeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  // { label: "Index", href: "#" },
  { label: "Gallery", href: "#gallery" },
  // { label: "Photographers", href: "#" },
  // { label: "Collections", href: "#" },
  // { label: "About", href: "#" },
  // { label: "Contact", href: "#" },
];

/**
 * SiteHeader
 *
 * Fixed header that floats above the hero image (z-50).
 * Transparent by default — no background — to let the hero image show through,
 * matching the reference where the nav sits directly on the image.
 *
 * The ref is forwarded so HeroSection can animate the header's entrance.
 */
const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(
  ({ theme, onToggleTheme }, ref) => {
    return (
      <header
        ref={ref}
        role="banner"
        className="
          fixed top-0 left-0 right-0
          z-50
          px-5 sm:px-8 md:px-12 lg:px-16
          h-14 md:h-16
          flex items-center justify-between
          bg-black/30
          dark:bg-transparent
        "
        style={{
          /* Ultra-thin top border to ground the header visually */
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* ── Logo ── */}
        <button
          onClick={() => {
            const topOfThePage = document.getElementById("top-of-the-page");
            if (topOfThePage) {
              topOfThePage.scrollIntoView({ behavior: "smooth" });
            }
          }}
          type="button"
          aria-label="Frame Flow — home"
          className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
        >
          <div
            className="
              hero-display-heading
              w-7 h-7 rounded-lg
              bg-white/20 backdrop-blur-sm
              flex items-center justify-center
              text-base leading-none
              font-extrabold!
              transition-transform duration-200 group-hover:rotate-12
            "
            aria-hidden="true"
          >
            FF
            {/* 🦉 */}
          </div>
          <span className="text-white text-sm font-semibold tracking-tight hidden sm:inline">
            Frame Flow
          </span>
        </button>

        {/* ── Primary navigation ── */}
        <nav aria-label="Primary navigation">
          <ul className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <button
                  onClick={() => {
                    const topOfThePage = document.getElementById(href.substring(1));
                    if (topOfThePage) {
                      topOfThePage.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  type="button"
                  className="
                    text-white/75 hover:text-white
                    text-xs font-medium tracking-wide
                    transition-colors duration-150
                    focus:outline-none focus-visible:ring-2
                    focus-visible:ring-white/50 focus-visible:rounded
                    cursor-pointer
                  "
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Action icons ── */}
        <div className="flex items-center gap-3">
          {/* Search icon */}
          <button
            onClick={() => {
              const gallery = document.getElementById("gallery");
              if (gallery) {
                gallery.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => {
                  const input = document.getElementById("gallery-search") as HTMLInputElement | null;
                  input?.focus();
                }, 500);
              }
            }}
            type="button"
            aria-label="Open search"
            className="
              p-1.5 rounded-md text-white/70 hover:text-white
              hover:bg-white/10 transition-all duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
              cursor-pointer
            "
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => {
              onToggleTheme();
            }}
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="
              p-1.5 rounded-md text-white/70 hover:text-white
              hover:bg-white/10 transition-all duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
              cursor-pointer
            "
          >
            {theme === "dark" ? (
              <FontAwesomeIcon icon={faSun} />
            ) : (
              <FontAwesomeIcon icon={faMoon} />
            )}
          </button>
        </div>
      </header>
    );
  }
);

SiteHeader.displayName = "SiteHeader";

export default SiteHeader;
