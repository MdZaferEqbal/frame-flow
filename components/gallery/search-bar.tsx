import React, { useState } from "react";

interface SearchBarProps {
  initialValue: string;
  onSearch: (query: string) => void;
}

const SUGGESTIONS = ["Nature", "Architecture", "People", "Sports", "Travel"];

export default function SearchBar({ initialValue, onSearch }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue.trim());
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <label htmlFor="gallery-search" className="sr-only">
          Search photos and videos
        </label>
        <div className="absolute left-4 text-zinc-400 dark:text-zinc-500 pointer-events-none">
          <svg
            className="w-5 h-5 animate-pulse-slow"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          id="gallery-search"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search for amazing high-res photos & videos..."
          className="w-full pl-12 pr-28 py-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:focus:ring-offset-zinc-950 transition-all duration-200 shadow-sm text-sm"
        />
        <div className="absolute right-2">
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 dark:focus:ring-offset-zinc-950 active:scale-95"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
        <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
          Popular searches:
        </span>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleSuggestionClick(suggestion)}
            className="px-3 py-1.5 text-xs rounded-xl font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
