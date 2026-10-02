import styles from "./PlayerChromeToggle.module.css";

type Props = {
  visible: boolean;
  active: boolean;
  onToggle: () => void;
  onPointerEnter: () => void;
};

export function PlayerChromeToggle({
  visible,
  active,
  onToggle,
  onPointerEnter,
}: Props) {
  return (
    <button
      type="button"
      className={`${styles.button} ${visible ? styles.visible : ""} ${active ? styles.active : ""}`}
      aria-label={active ? "Hide window and playback controls" : "Show window and playback controls"}
      aria-pressed={active}
      title={active ? "Hide controls" : "Show controls"}
      onClick={onToggle}
      onPointerEnter={onPointerEnter}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      </svg>
    </button>
  );
}
