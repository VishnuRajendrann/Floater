import { usePlayerCommandsRef } from "../context/PlayerCommandsContext";
import { usePlayer } from "../../../state/player/playerContext";
import { YT_PLAYER_STATE } from "../../../integrations/youtube/types";
import { useEffect } from "react";

export function usePlayerKeyboardShortcuts(enabled: boolean) {
  const commandsRef = usePlayerCommandsRef();
  const { state } = usePlayer();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        return;
      }
      const commands = commandsRef.current;
      if (!commands) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case " ":
          event.preventDefault();
          if (state.ytState === YT_PLAYER_STATE.PLAYING) {
            commands.pause();
          } else {
            commands.play();
          }
          break;
        case "f":
          void document.getElementById("player-shell")?.requestFullscreen();
          break;
        case "m":
          commands.toggleMute();
          break;
        case "arrowleft":
          commands.seekTo(Math.max(0, state.currentTime - 5));
          break;
        case "arrowright":
          commands.seekTo(state.currentTime + 5);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, commandsRef, state.currentTime, state.ytState]);
}
