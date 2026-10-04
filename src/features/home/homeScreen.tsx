import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useApp } from "../../app/AppShell";
import { fetchVideoTitle } from "../../integrations/youtube/youtubeRuntime";
import {
  addRecentVideo,
  clearRecentVideos,
  loadRecentVideos,
  updateRecentVideoTitle,
  type RecentVideoEntry,
} from "../../storage/recentVideosStore";
import type { AppError } from "../../types/errors";

type RecentVideosContextValue = {
  items: RecentVideoEntry[];
  recordVideo: (videoId: string, url: string) => void;
  clearHistory: () => void;
};

const RecentVideosContext = createContext<RecentVideosContextValue | null>(null);

export function RecentVideosProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RecentVideoEntry[]>(() => loadRecentVideos());

  const recordVideo = useCallback((videoId: string, url: string) => {
    const next = addRecentVideo({ videoId, url });
    setItems(next);
    void fetchVideoTitle(url).then((title) => {
      if (!title) {
        return;
      }
      setItems(updateRecentVideoTitle(videoId, title));
    });
  }, []);

  const clearHistory = useCallback(() => {
    clearRecentVideos();
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({ items, recordVideo, clearHistory }),
    [items, recordVideo, clearHistory],
  );

  return (
    <RecentVideosContext.Provider value={value}>
      {children}
    </RecentVideosContext.Provider>
  );
}

function useRecentVideos(): RecentVideosContextValue {
  const ctx = useContext(RecentVideosContext);
  if (!ctx) {
    throw new Error("useRecentVideos must be used within RecentVideosProvider");
  }
  return ctx;
}

export { useRecentVideos };

type UrlInputFormProps = {
  onSubmit: (url: string) => void;
  error: AppError | null;
};

export function UrlInputForm({ onSubmit, error }: UrlInputFormProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    onSubmit(value.trim());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col gap-[var(--space-sm)]">
      <label className="text-sm font-medium text-text-muted" htmlFor="youtube-url">
        YouTube URL
      </label>
      <div className="flex flex-wrap gap-[var(--space-sm)]">
        <input
          id="youtube-url"
          className="min-w-0 flex-[1_1_10rem] rounded-md border border-border bg-surface-elevated px-3 py-2.5 text-text"
          type="url"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="shrink-0 rounded-md border-0 bg-accent px-4 py-2.5 font-semibold text-white hover:bg-accent-hover"
          onClick={submit}
        >
          Load
        </button>
      </div>
      {error ? (
        <p className="m-0 text-sm text-danger" role="alert">
          {error.message}
          {import.meta.env.DEV && error.debug ? (
            <span className="text-text-muted"> ({error.debug})</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

export function RecentVideosList() {
  const { items, clearHistory } = useRecentVideos();
  const { loadVideo } = useApp();

  if (items.length === 0) {
    return (
      <p className="mt-[var(--space-xl)] text-sm text-text-muted">
        Recently opened videos will appear here.
      </p>
    );
  }

  return (
    <section className="mt-[var(--space-xl)] min-w-0 max-w-full text-left" aria-label="Recent videos">
      <div className="mb-[var(--space-sm)] flex flex-wrap items-center justify-between gap-[var(--space-md)]">
        <h2 className="m-0 text-base font-semibold">Recent</h2>
        <button
          type="button"
          className="border-0 bg-transparent text-sm text-accent"
          onClick={() => {
            if (window.confirm("Clear recent video history on this device?")) {
              clearHistory();
            }
          }}
        >
          Clear history
        </button>
      </div>
      <ul className="m-0 grid min-w-0 max-w-full list-none gap-[var(--space-sm)] p-0">
        {items.map((item) => (
          <li key={item.videoId} className="min-w-0 max-w-full">
            <button
              type="button"
              className="box-border flex w-full max-w-full min-w-0 gap-[var(--space-md)] overflow-hidden rounded-md border border-border bg-surface-elevated p-[var(--space-sm)] text-left text-inherit hover:border-accent"
              onClick={() => loadVideo(item.videoId, item.url)}
            >
              <img
                className="aspect-video h-auto w-[min(120px,35vw)] shrink-0 rounded-md bg-black object-cover"
                src={`https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`}
                alt=""
                loading="lazy"
                width={120}
                height={68}
              />
              <span className="flex min-w-0 flex-col gap-[var(--space-xs)]">
                <span className="truncate font-semibold">
                  {item.title ?? item.videoId}
                </span>
                <span className="truncate text-xs text-text-muted">{item.url}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
