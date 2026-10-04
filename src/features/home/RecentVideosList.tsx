import { useRef, useState, type TransitionEvent } from "react";
import { useApp } from "../../app/providers/AppProvider";
import { cn } from "../../shared/lib/cn";
import { useRecentVideos } from "./recentVideosContext";

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

export function RecentVideosList() {
  const { items, clearHistory } = useRecentVideos();
  const { loadVideo } = useApp();
  const [deleting, setDeleting] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [boxHeight, setBoxHeight] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const emptyProbeRef = useRef<HTMLParagraphElement>(null);
  const finishedRef = useRef(false);

  const finishClear = () => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    clearHistory();
    setBoxHeight(null);
    setExiting(false);
    setDeleting(false);
  };

  const handleClear = () => {
    if (deleting || exiting) {
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const box = boxRef.current;
    const probe = emptyProbeRef.current;
    if (reduceMotion || !box || !probe) {
      clearHistory();
      return;
    }
    finishedRef.current = false;
    const style = getComputedStyle(box);
    const chrome =
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom) +
      parseFloat(style.borderTopWidth) +
      parseFloat(style.borderBottomWidth);
    const current = box.getBoundingClientRect().height;
    const target = Math.ceil(probe.getBoundingClientRect().height + chrome);
    setDeleting(true);
    setExiting(true);
    setBoxHeight(current);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setBoxHeight(target));
    });
    window.setTimeout(finishClear, 700);
  };

  const handleBoxTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "height" || event.target !== boxRef.current) {
      return;
    }
    finishClear();
  };

  return (
    <section className="mt-[var(--space-xl)] min-w-0 max-w-full text-left" aria-label="Recent videos">
      <div className="mb-[var(--space-sm)] flex flex-wrap items-center justify-between gap-[var(--space-md)]">
        <h2 className="m-0 text-base font-semibold">Recent</h2>
        {items.length > 0 ? (
          <button
            type="button"
            className="trash-clear ui-filled inline-flex size-9 items-center justify-center p-0"
            aria-label="Clear history"
            title="Clear history"
            onClick={handleClear}
          >
            <TrashIcon deleting={deleting} />
          </button>
        ) : null}
      </div>
      <div
        ref={boxRef}
        className="relative min-w-0 max-w-full overflow-hidden rounded-md border border-border bg-surface-elevated p-[var(--space-sm)] transition-[height] duration-500 ease-in-out motion-reduce:transition-none"
        style={boxHeight === null ? undefined : { height: boxHeight }}
        onTransitionEnd={handleBoxTransitionEnd}
      >
        <p
          ref={emptyProbeRef}
          className="pointer-events-none invisible absolute inset-x-0 top-0 m-0 text-sm"
          aria-hidden
        >
          Recently opened videos will appear here.
        </p>
        {items.length === 0 ? (
          <p className="m-0 text-sm text-text-muted">
            Recently opened videos will appear here.
          </p>
        ) : (
          <ul
            className={cn(
              "m-0 grid min-w-0 max-w-full list-none gap-[var(--space-sm)] p-0",
              exiting && "trash-list-out",
            )}
          >
            {items.map((item) => (
              <li key={item.videoId} className="min-w-0 max-w-full">
                <button
                  type="button"
                  className="box-border flex w-full max-w-full min-w-0 gap-[var(--space-md)] overflow-hidden rounded-md border border-border bg-surface p-[var(--space-sm)] text-left text-inherit hover:border-accent"
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
        )}
      </div>
    </section>
  );
}
