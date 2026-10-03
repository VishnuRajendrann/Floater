import { useEffect, useRef, useState } from "react";
import {
  errorCategoryHeadline,
  isRetryableError,
} from "../../../types/errors";
import { resetIframeApiLoadState } from "../../../integrations/youtube/loadIframeApi";
import {
  usePlayerDispatch,
  usePlayerMeta,
} from "../../../state/player/playerContext";

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
      className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-[var(--space-md)] bg-black/75 p-[var(--space-lg)] text-center text-white"
      role="alert"
      tabIndex={-1}
    >
      <h2 className="m-0 text-lg font-semibold">
        {errorCategoryHeadline(error.code)}
      </h2>
      <p className="m-0 max-w-sm leading-normal text-white/90">{error.message}</p>
      {retryExhausted ? (
        <p className="m-0 text-sm text-white/75">
          Still having trouble. Try another video or check your connection.
        </p>
      ) : null}
      {import.meta.env.DEV && error.debug ? (
        <details className="text-left text-xs text-white/65">
          <summary>Details</summary>
          <p>{error.debug}</p>
        </details>
      ) : null}
      <div className="flex flex-wrap justify-center gap-[var(--space-sm)]">
        {canRetry ? (
          <button
            type="button"
            className="rounded-md border-0 bg-accent px-4 py-2 font-semibold text-white"
            onClick={handleRetry}
          >
            Retry
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-md border border-white/35 bg-transparent px-4 py-2 text-white"
          onClick={onNewUrl}
        >
          New URL
        </button>
      </div>
    </div>
  );
}
