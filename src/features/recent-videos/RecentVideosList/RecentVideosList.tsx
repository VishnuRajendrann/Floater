import { useApp } from "../../../app/providers/AppProvider";
import { useRecentVideos } from "../recentVideosContext";
import styles from "./RecentVideosList.module.css";

export function RecentVideosList() {
  const { items, clearHistory } = useRecentVideos();
  const { loadVideo } = useApp();

  if (items.length === 0) {
    return (
      <p className={styles.empty}>Recently opened videos will appear here.</p>
    );
  }

  return (
    <section className={styles.section} aria-label="Recent videos">
      <div className={styles.header}>
        <h2 className={styles.title}>Recent</h2>
        <button
          type="button"
          className={styles.clear}
          onClick={() => {
            if (window.confirm("Clear recent video history on this device?")) {
              clearHistory();
            }
          }}
        >
          Clear history
        </button>
      </div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.videoId}>
            <button
              type="button"
              className={styles.item}
              onClick={() => loadVideo(item.videoId, item.url)}
            >
              <img
                className={styles.thumb}
                src={`https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`}
                alt=""
                loading="lazy"
                width={120}
                height={68}
              />
              <span className={styles.meta}>
                <span className={styles.videoTitle}>
                  {item.title ?? item.videoId}
                </span>
                <span className={styles.url}>{item.url}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
