import { useState, type FormEvent } from "react";
import { useApp } from "../app/providers/AppProvider";
import { AlwaysOnTopToggle } from "../features/preferences/AlwaysOnTopToggle";
import { ThemeToggle } from "../features/preferences/ThemeToggle";
import { RecentVideosList } from "../features/home/RecentVideosList";
import { UrlInputForm } from "../features/home/UrlInputForm";
import { parseYoutubeUrl } from "../integrations/youtube/parseYoutubeUrl";
import { parseFailureToAppError } from "../integrations/youtube/mapYoutubeErrorCode";
import { cn } from "../shared/lib/cn";
import { usePreferences } from "../state/preferences/preferencesContext";
import { resetLocalData } from "../storage/resetLocalData";
import type { AppError } from "../types/errors";

function TrashIcon({ deleting }: { deleting: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("trash-bin size-5", deleting && "trash-bin-shake")}
      aria-hidden
    >
      <g className={cn("trash-lid", deleting && "trash-lid-open")}>
        <path d="M3 6h18" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </g>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
export function Home() {
  const { loadVideo } = useApp();
  const { alwaysOnTopEnabled } = usePreferences();
  const [error, setError] = useState<AppError | null>(null);
  const [clearingCache, setClearingCache] = useState(false);

  const handleSubmit = (url: string) => {
    const result = parseYoutubeUrl(url);
    if (!result.ok) {
      setError(parseFailureToAppError(result.code));
      return;
    }
    setError(null);
    loadVideo(result.videoId, url.trim());
  };

  const handleClearCache = () => {
    if (clearingCache) {
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      resetLocalData();
      window.location.reload();
      return;
    }
    setClearingCache(true);
    window.setTimeout(() => {
      resetLocalData();
      window.location.reload();
    }, 480);
  };

  return (
    <main className="box-border flex h-full flex-col items-center overflow-x-hidden overflow-y-auto">
      <div className="my-auto box-border w-full min-w-0 max-w-lg shrink-0 overflow-x-hidden rounded-lg border border-border bg-surface p-[var(--space-xl)] shadow-[0_12px_40px_rgb(0_0_0/0.25)]">
        <div className="mb-[var(--space-sm)] flex items-start justify-between gap-[var(--space-md)]">
          <h1 className="m-2 text-[clamp(1.5rem,5vw,2rem)] font-bold tracking-tight">
            Fl<span className="text-accent">o</span>ater
          </h1>
          <div className="relative top-[10px] flex flex-wrap items-center justify-end gap-[var(--space-sm)]">
            <span>
              <img
                src={alwaysOnTopEnabled ? "/assets/oraora.gif" : "/assets/float-idle.png"}
                alt=""
                aria-hidden
                className="pointer-events-none inline-block h-[60px] w-auto select-none align-middle"
              />
            </span>
            <AlwaysOnTopToggle />
            <ThemeToggle />
          </div>
        </div>
        <form
          className="mt-[var(--space-md)]"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
          }}
        >
          <UrlInputForm onSubmit={handleSubmit} error={error} />
        </form>
        <RecentVideosList />
        <button
          type="button"
          className="trash-clear ui-filled mt-[var(--space-lg)] inline-flex items-center gap-2 px-4 py-2 text-sm"
          onClick={handleClearCache}
        >
          <TrashIcon deleting={clearingCache} />
          Clear cache
        </button>
      </div>
    </main>
  );
}
