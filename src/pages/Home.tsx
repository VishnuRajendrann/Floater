import { useState, type FormEvent } from "react";
import { useApp } from "../app/providers/AppProvider";
import { AlwaysOnTopToggle } from "../features/preferences/AlwaysOnTopToggle";
import { ThemeToggle } from "../features/preferences/ThemeToggle";
import { RecentVideosList } from "../features/home/RecentVideosList";
import { UrlInputForm } from "../features/home/UrlInputForm";
import { parseYoutubeUrl } from "../integrations/youtube/parseYoutubeUrl";
import { parseFailureToAppError } from "../integrations/youtube/mapYoutubeErrorCode";
import { resetLocalData } from "../storage/resetLocalData";
import type { AppError } from "../types/errors";

export function Home() {
  const { loadVideo } = useApp();
  const [error, setError] = useState<AppError | null>(null);

  const handleSubmit = (url: string) => {
    const result = parseYoutubeUrl(url);
    if (!result.ok) {
      setError(parseFailureToAppError(result.code));
      return;
    }
    setError(null);
    loadVideo(result.videoId, url.trim());
  };

  return (
    <main className="box-border flex h-full flex-col items-center overflow-x-hidden overflow-y-auto p-[clamp(var(--space-sm),3vw,var(--space-xl))]">
      <div className="my-auto box-border w-full min-w-0 max-w-lg shrink-0 overflow-x-hidden rounded-lg border border-border bg-surface p-[clamp(var(--space-md),4vw,var(--space-xl))] shadow-[0_12px_40px_rgb(0_0_0/0.25)]">
        <div className="mb-[var(--space-sm)] flex items-start justify-between gap-[var(--space-md)]">
          <h1
            className="m-0 text-[clamp(1.5rem,5vw,2rem)] font-bold tracking-tight"
            data-tauri-drag-region
          >
            Floater
          </h1>
          <div className="tauri-no-drag flex flex-wrap justify-end gap-[var(--space-sm)]">
            <AlwaysOnTopToggle />
            <ThemeToggle />
          </div>
        </div>
        <p className="mb-[var(--space-lg)] text-[clamp(0.875rem,2.5vw,1rem)] leading-normal text-text-muted">
          Paste a YouTube link for a focused desktop viewing experience.
        </p>
        <form
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
          }}
        >
          <UrlInputForm onSubmit={handleSubmit} error={error} />
        </form>
        <RecentVideosList />
        <p className="mt-[var(--space-lg)] text-xs text-text-muted">
          History and preferences stay on this device.
        </p>
        <button
          type="button"
          className="mt-[var(--space-sm)] border-0 bg-transparent text-xs text-text-muted underline"
          onClick={() => {
            if (
              window.confirm(
                "Reset preferences and recent videos stored on this device?",
              )
            ) {
              resetLocalData();
              window.location.reload();
            }
          }}
        >
          Reset local data
        </button>
      </div>
    </main>
  );
}
