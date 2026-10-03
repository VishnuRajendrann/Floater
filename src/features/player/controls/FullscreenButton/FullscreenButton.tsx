import { useEffect } from "react";
import type { RefObject } from "react";
import { usePlayerDispatch, usePlayerMeta } from "../../../../state/player/playerContext";
import { IconFullscreen, IconFullscreenExit } from "../PlayerIcons";

type Props = {
  shellRef: RefObject<HTMLDivElement | null>;
  disabled?: boolean;
};

export function FullscreenButton({ shellRef, disabled }: Props) {
  const { isFullscreen } = usePlayerMeta();
  const dispatch = usePlayerDispatch();

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
      className="player-control-btn"
      disabled={disabled}
      aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
      onClick={() => void toggle()}
    >
      {isFullscreen ? <IconFullscreenExit /> : <IconFullscreen />}
    </button>
  );
}
