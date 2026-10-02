import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { YT_PLAYER_STATE } from "../../../integrations/youtube/types";
import { usePlayerMeta } from "../../../state/player/playerContext";

const HIDE_DELAY_MS = 3000;

type Options = {
  shellRef: RefObject<HTMLElement | null>;
  paused: boolean;
  enabled: boolean;
};

export function useControlBarAutoHide({ shellRef, paused, enabled }: Options) {
  const { loadPhase } = usePlayerMeta();
  const pinVisible = !enabled || loadPhase !== "ready" || paused;
  const [idleHidden, setIdleHidden] = useState(false);
  const timerRef = useRef<number | null>(null);
  const interactingRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimer();
    if (pinVisible || interactingRef.current) {
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setIdleHidden(true);
    }, HIDE_DELAY_MS);
  }, [clearTimer, pinVisible]);

  const show = useCallback(() => {
    setIdleHidden(false);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    if (pinVisible) {
      clearTimer();
    } else {
      scheduleHide();
    }
    return clearTimer;
  }, [pinVisible, clearTimer, scheduleHide]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const onMove = () => show();
    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && shell.contains(event.target)) {
        show();
      }
    };

    shell.addEventListener("mousemove", onMove);
    shell.addEventListener("focusin", onFocusIn);
    return () => {
      shell.removeEventListener("mousemove", onMove);
      shell.removeEventListener("focusin", onFocusIn);
    };
  }, [shellRef, show]);

  const onBarPointerEnter = useCallback(() => {
    interactingRef.current = true;
    show();
  }, [show]);

  const onBarPointerLeave = useCallback(() => {
    interactingRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  const onBarPointerDown = useCallback(() => {
    interactingRef.current = true;
    show();
  }, [show]);

  const onBarPointerUp = useCallback(() => {
    interactingRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  const onShortcutActivity = useCallback(() => {
    show();
  }, [show]);

  return {
    visible: pinVisible || !idleHidden,
    onBarPointerEnter,
    onBarPointerLeave,
    onBarPointerDown,
    onBarPointerUp,
    onShortcutActivity,
  };
}

export function useIsPlayerPaused(ytState: number | null): boolean {
  return ytState === YT_PLAYER_STATE.PAUSED || ytState === YT_PLAYER_STATE.ENDED;
}
