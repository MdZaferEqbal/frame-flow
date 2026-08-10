import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const isKeyMissing =
    error.toLowerCase().includes("api_key") ||
    error.toLowerCase().includes("api key") ||
    error.toLowerCase().includes("unauthorized");

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-6 rounded-2xl bg-red-50/30 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 max-w-md mx-auto transition-colors duration-200 my-8">
      <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-5">
        <FontAwesomeIcon icon={faCircleXmark} />
      </div>

      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {isKeyMissing ? "API Configuration Required" : "Unable to load gallery"}
      </h3>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 max-w-sm">
        {error}
      </p>

      {isKeyMissing ? (
        <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-xl text-left font-mono border border-zinc-200 dark:border-zinc-800/80 w-full max-w-sm">
          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
            To set up your API Key:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
            <li>
              Create a{" "}
              <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-bold">
                .env.local
              </code>{" "}
              file in the root folder
            </li>
            <li>
              Add{" "}
              <code className="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded font-bold break-all">
                PEXELS_API_KEY=your_key
              </code>
            </li>
            <li>Restart your development server</li>
          </ol>
        </div>
      ) : (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 dark:focus:ring-offset-zinc-900 cursor-pointer"
        >
          Try again
        </button>
      )}
    </div>
  );
}
