import { useEffect, useRef, useState } from "react";
import {
  errorCategoryHeadline,
  isRetryableError,
} from "../../../../types/errors";
import { resetIframeApiLoadState } from "../../../../integrations/youtube/loadIframeApi";
import {
  usePlayerDispatch,
  usePlayerMeta,
} from "../../../../state/player/playerContext";
import styles from "./PlayerErrorPanel.module.css";

const MAX_RETRIES = 3;

type Props = {
  onNewUrl: () => void;
};

export function PlayerErrorPanel({ onNewUrl }: Props) {
  const { loadPhase, error } = usePlayerMeta();
  const dispatch = usePlayerDispatch();
  const panelRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (loadPhase === "error" && error) {
      panelRef.current?.focus();
    }
  }, [loadPhase, error]);

  if (loadPhase !== "error" || !error) {
    return null;
  }

  const retryExhausted = retryCount >= MAX_RETRIES;
  const canRetry = isRetryableError(error.code) && !retryExhausted;

  const handleRetry = () => {
    if (!canRetry) {
      return;
    }
    setRetryCount((count) => count + 1);
    resetIframeApiLoadState();
    dispatch({ type: "RETRY" });
  };

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      role="alert"
      tabIndex={-1}
    >
      <h2 className={styles.headline}>{errorCategoryHeadline(error.code)}</h2>
      <p className={styles.message}>{error.message}</p>
      {retryExhausted ? (
        <p className={styles.hint}>
          Still having trouble. Try another video or check your connection.
        </p>
      ) : null}
      {import.meta.env.DEV && error.debug ? (
        <details className={styles.details}>
          <summary>Details</summary>
          <p>{error.debug}</p>
        </details>
      ) : null}
      <div className={styles.actions}>
        {canRetry ? (
          <button type="button" className={styles.button} onClick={handleRetry}>
            Retry
          </button>
        ) : null}
        <button type="button" className={styles.secondary} onClick={onNewUrl}>
          New URL
        </button>
      </div>
    </div>
  );
}
