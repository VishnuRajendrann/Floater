import { useEffect, useRef } from "react";
import { usePlayerCommands } from "../context/PlayerCommandsContext";
import {
  usePlayerMeta,
  usePlayerProgress,
} from "../../../state/player/playerContext";
import { isEditableTarget } from "../../../keyboard/isEditableTarget";
import { runPlayerShortcut } from "../../../keyboard/playerShortcuts";

type Options = {
  enabled: boolean;
  onActivity?: () => void;
};

export function usePlayerKeyboardShortcuts({ enabled, onActivity }: Options) {
  const commands = usePlayerCommands();
  const { ytState } = usePlayerMeta();
  const { currentTime } = usePlayerProgress();
  const ytStateRef = useRef(ytState);
  const currentTimeRef = useRef(currentTime);

  useEffect(() => {
    ytStateRef.current = ytState;
    currentTimeRef.current = currentTime;
  }, [ytState, currentTime]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }
      runPlayerShortcut(event, {
        commands,
        ytState: ytStateRef.current,
        currentTime: currentTimeRef.current,
        onActivity,
      });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, commands, onActivity]);
}
