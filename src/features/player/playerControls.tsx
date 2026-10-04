import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { YT_PLAYER_STATE } from "../../integrations/youtube/youtubeCore";
import { PlayerControlButton } from "../../shared/ui";
import { usePlayerCommands } from "./PlayerCommandsContext";
import {
  usePlayerDispatch,
  usePlayerMeta,
  usePlayerProgress,
} from "../../state/player/playerContext";

type DisabledProps = { disabled?: boolean };

function commandButton({
  disabled,
  active,
  label,
  title,
  pressed,
  onClick,
  children,
}: DisabledProps & {
  active?: boolean;
  label: string;
  title: string;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <PlayerControlButton
      active={active}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={title}
      onClick={onClick}
    >
      {children}
    </PlayerControlButton>
  );
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = s.toString().padStart(2, "0");
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${ss}`;
  }
  return `${m}:${ss}`;
}

export function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M8 5v14l11-7z" />
    </svg>
  );
}

export function IconPause() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}

export function IconVolume() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
      />
    </svg>
  );
}

export function IconMuted() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"
      />
    </svg>
  );
}

export function IconFullscreen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
      />
    </svg>
  );
}

export function IconFullscreenExit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
      />
    </svg>
  );
}

export function IconCaptions() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H5V6h14v12zM7 15h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H7v6zm8 0h2v-2h-2v2zm0-4h2V9h-2v2z"
      />
    </svg>
  );
}

export function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96a7.02 7.02 0 0 0-1.63-.94l-.36-2.54A.484.484 0 0 0 14 2h-4a.484.484 0 0 0-.48.42l-.36 2.54c-.59.24-1.13.56-1.63.94l-2.39-.96a.488.488 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54c.05.24.24.42.48.42h4c.24 0 .44-.18.48-.42l.36-2.54c.59-.24 1.13-.56 1.63-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"
      />
    </svg>
  );
}

export function PlayPauseButton({ disabled }: DisabledProps) {
  const { ytState } = usePlayerMeta();
  const commands = usePlayerCommands();
  const playing = ytState === YT_PLAYER_STATE.PLAYING;

  return commandButton({
    disabled,
    label: playing ? "Pause" : "Play",
    title: playing ? "Pause (Space)" : "Play (Space)",
    onClick: () => (playing ? commands.pause() : commands.play()),
    children: playing ? <IconPause /> : <IconPlay />,
  });
}

export function MuteButton({ disabled }: DisabledProps) {
  const { muted } = usePlayerMeta();
  const commands = usePlayerCommands();

  return commandButton({
    active: muted,
    disabled,
    label: muted ? "Unmute" : "Mute",
    pressed: muted,
    title: muted ? "Unmute (M)" : "Mute (M)",
    onClick: () => commands.toggleMute(),
    children: muted ? <IconMuted /> : <IconVolume />,
  });
}

export function CaptionsToggle({ disabled }: DisabledProps) {
  const commands = usePlayerCommands();
  const [enabled, setEnabled] = useState(false);

  return commandButton({
    active: enabled,
    disabled,
    label: enabled ? "Turn off captions" : "Turn on captions",
    pressed: enabled,
    title: enabled ? "Captions on" : "Captions off",
    onClick: () => {
      const next = !enabled;
      commands.setCaptions(next);
      setEnabled(next);
    },
    children: <IconCaptions />,
  });
}

type FullscreenButtonProps = {
  shellRef: RefObject<HTMLDivElement | null>;
  disabled?: boolean;
};

export function FullscreenButton({ shellRef, disabled }: FullscreenButtonProps) {
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
    <PlayerControlButton
      disabled={disabled}
      aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
      onClick={() => void toggle()}
    >
      {isFullscreen ? <IconFullscreenExit /> : <IconFullscreen />}
    </PlayerControlButton>
  );
}

export function SeekBar({ disabled }: DisabledProps) {
  const { currentTime, duration, isSeeking } = usePlayerProgress();
  const dispatch = usePlayerDispatch();
  const commands = usePlayerCommands();
  const max = Math.max(duration, 0);

  return (
    <input
      className="control-bar-range min-w-16 flex-1"
      type="range"
      min={0}
      max={max}
      step={0.1}
      value={Math.min(currentTime, max)}
      disabled={disabled || max <= 0}
      aria-label="Seek"
      aria-valuetext={`${Math.floor(currentTime)} seconds`}
      onPointerDown={() => dispatch({ type: "SEEK_START" })}
      onChange={(event) => {
        const value = Number(event.target.value);
        commands.seekTo(value);
        dispatch({ type: "SEEK_END", currentTime: value });
      }}
      onPointerUp={() => {
        if (isSeeking) {
          dispatch({ type: "SEEK_END", currentTime });
        }
      }}
    />
  );
}

export function VolumeSlider({ disabled }: DisabledProps) {
  const { volume, muted } = usePlayerMeta();
  const dispatch = usePlayerDispatch();
  const commands = usePlayerCommands();

  return (
    <input
      className="control-bar-range volumeControl w-20 max-[720px]:hidden"
      type="range"
      min={0}
      max={100}
      value={muted ? 0 : volume}
      disabled={disabled}
      aria-label="Volume"
      onChange={(event) => {
        const nextVolume = Number(event.target.value);
        commands.setVolume(nextVolume);
        dispatch({ type: "SET_VOLUME", volume: nextVolume });
      }}
    />
  );
}

export function TimeDisplay() {
  const { currentTime, duration } = usePlayerProgress();
  return (
    <span className="min-w-[6.5rem] text-xs whitespace-nowrap text-text-muted">
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  );
}
