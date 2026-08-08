import React from "react";

interface EmptyStateProps {
  query: string;
  onClear: () => void;
}

export default function EmptyState({ query, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 max-w-md mx-auto transition-colors duration-200 my-10">
      <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 mb-5">
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        No results found
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs">
        We couldn&apos;t find any media matching{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-200">
          &ldquo;{query}&rdquo;
        </span>
        . Try checking for spelling errors or search for another keyword.
      </p>
      <button
        onClick={onClear}
        type="button"
        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 dark:focus:ring-offset-zinc-900 cursor-pointer"
      >
        Clear search query
      </button>
    </div>
  );
}
