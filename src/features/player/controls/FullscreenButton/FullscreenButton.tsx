import { useEffect } from "react";
import type { RefObject } from "react";
import { usePlayer } from "../../../../state/player/playerContext";
import styles from "./FullscreenButton.module.css";

type Props = {
  shellRef: RefObject<HTMLDivElement | null>;
  disabled?: boolean;
};

export function FullscreenButton({ shellRef, disabled }: Props) {
  const { state, dispatch } = usePlayer();

  useEffect(() => {
    const onChange = () => {
      dispatch({
        type: "SET_FULLSCREEN",
        isFullscreen: document.fullscreenElement === shellRef.current,
      });
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [dispatch, shellRef]);

  const toggle = async () => {
    const el = shellRef.current;
    if (!el) {
      return;
    }
    if (document.fullscreenElement === el) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
  };

  return (
    <button
      type="button"
      className={styles.button}
      disabled={disabled}
      aria-label={state.isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      onClick={() => void toggle()}
    >
      ⛶
    </button>
  );
}
