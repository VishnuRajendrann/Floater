import { YT_PLAYER_STATE } from "../integrations/youtube/types";
import type { PlayerCommands } from "../features/player/context/PlayerCommandsContext";

export type PlayerShortcutContext = {
  commands: PlayerCommands;
  ytState: number | null;
  currentTime: number;
  onActivity?: () => void;
};

export type PlayerShortcut = {
  id: string;
  match: (event: KeyboardEvent) => boolean;
  run: (ctx: PlayerShortcutContext, event: KeyboardEvent) => void;
};

function keyMatch(event: KeyboardEvent, key: string): boolean {
  return event.key.toLowerCase() === key.toLowerCase();
}

export const PLAYER_SHORTCUTS: PlayerShortcut[] = [
  {
    id: "playPause",
    match: (event) => keyMatch(event, " "),
    run: (ctx, event) => {
      event.preventDefault();
      if (ctx.ytState === YT_PLAYER_STATE.PLAYING) {
        ctx.commands.pause();
      } else {
        ctx.commands.play();
      }
    },
  },
  {
    id: "fullscreen",
    match: (event) => keyMatch(event, "f"),
    run: () => {
      const shell = document.getElementById("player-shell");
      if (!shell) {
        return;
      }
      if (document.fullscreenElement === shell) {
        void document.exitFullscreen();
      } else {
        void shell.requestFullscreen();
      }
    },
  },
  {
    id: "mute",
    match: (event) => keyMatch(event, "m"),
    run: (ctx) => {
      ctx.commands.toggleMute();
    },
  },
  {
    id: "seekBack",
    match: (event) => event.key === "ArrowLeft",
    run: (ctx) => {
      ctx.commands.seekTo(Math.max(0, ctx.currentTime - 5));
    },
  },
  {
    id: "seekForward",
    match: (event) => event.key === "ArrowRight",
    run: (ctx) => {
      ctx.commands.seekTo(ctx.currentTime + 5);
    },
  },
];

export const PLAYER_SHORTCUT_LABELS: { keys: string; description: string }[] = [
  { keys: "Space", description: "Play / pause" },
  { keys: "F", description: "Toggle fullscreen" },
  { keys: "M", description: "Mute / unmute" },
  { keys: "← / →", description: "Seek 5 seconds" },
];

export function runPlayerShortcut(
  event: KeyboardEvent,
  ctx: PlayerShortcutContext,
): boolean {
  for (const shortcut of PLAYER_SHORTCUTS) {
    if (shortcut.match(event)) {
      shortcut.run(ctx, event);
      ctx.onActivity?.();
      return true;
    }
  }
  return false;
}
