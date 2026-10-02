import styles from "./PlayerWindowDragBand.module.css";

/** Always-on strip for moving the window when the native title bar is hidden. */
export function PlayerWindowDragBand() {
  return (
    <div
      className={styles.band}
      data-tauri-drag-region
      aria-hidden
      title="Drag to move window"
    />
  );
}
