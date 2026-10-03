import { useApp } from "../../../app/providers/AppProvider";
import { useRecentVideos } from "../recentVideosContext";

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
