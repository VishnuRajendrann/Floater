import { useState, type FormEvent } from "react";
import { useApp } from "../../app/providers/AppProvider";
import { AlwaysOnTopToggle } from "../../features/preferences/AlwaysOnTopToggle";
import { ThemeToggle } from "../../features/preferences/ThemeToggle";
import { RecentVideosList } from "../../features/recent-videos/RecentVideosList";
import { UrlInputForm } from "../../features/url-input/UrlInputForm";
import { parseYoutubeUrl } from "../../integrations/youtube/parseYoutubeUrl";
import { parseFailureToAppError } from "../../integrations/youtube/mapYoutubeErrorCode";
import { resetLocalData } from "../../storage/resetLocalData";
import type { AppError } from "../../types/errors";
import styles from "./Home.module.css";

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
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Floater</h1>
          <div className={styles.headerControls}>
            <AlwaysOnTopToggle />
            <ThemeToggle />
          </div>
        </div>
        <p className={styles.subtitle}>
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
        <p className={styles.privacy}>History and preferences stay on this device.</p>
        <button
          type="button"
          className={styles.reset}
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
