import { useState, type FormEvent } from "react";
import { useApp } from "../../app/providers/AppProvider";
import { UrlInputForm } from "../../features/url-input/UrlInputForm";
import { parseYoutubeUrl } from "../../integrations/youtube/parseYoutubeUrl";
import { parseFailureToAppError } from "../../integrations/youtube/mapYoutubeErrorCode";
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
    loadVideo(result.videoId);
  };

  const handleForm = (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Floater</h1>
        <p className={styles.subtitle}>
          Paste a YouTube link for a focused desktop viewing experience.
        </p>
        <form onSubmit={handleForm}>
          <UrlInputForm onSubmit={handleSubmit} error={error} />
        </form>
      </div>
    </main>
  );
}
