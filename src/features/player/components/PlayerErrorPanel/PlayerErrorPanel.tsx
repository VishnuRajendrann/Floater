import { usePlayer } from "../../../../state/player/playerContext";
import styles from "./PlayerErrorPanel.module.css";

type Props = {
  onRetryHome: () => void;
};

export function PlayerErrorPanel({ onRetryHome }: Props) {
  const { state } = usePlayer();

  if (state.loadPhase !== "error" || !state.error) {
    return null;
  }

  return (
    <div className={styles.panel} role="alert">
      <p className={styles.message}>{state.error.message}</p>
      {import.meta.env.DEV && state.error.debug ? (
        <p className={styles.debug}>{state.error.debug}</p>
      ) : null}
      <button type="button" className={styles.button} onClick={onRetryHome}>
        Try another URL
      </button>
    </div>
  );
}
