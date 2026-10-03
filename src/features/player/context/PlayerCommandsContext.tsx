import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";

export type PlayerCommands = {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleCaptions: () => boolean;
  areCaptionsEnabled: () => boolean;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  getAvailablePlaybackRates: () => number[];
  getPlaybackQuality: () => string;
  setPlaybackQuality: (quality: string) => void;
  getAvailableQualityLevels: () => string[];
};

const PlayerCommandsContext =
  createContext<MutableRefObject<PlayerCommands | null> | null>(null);

export function PlayerCommandsProvider({ children }: { children: ReactNode }) {
  const commandsRef = useRef<PlayerCommands | null>(null);
  const value = useMemo(() => commandsRef, []);
  return (
    <PlayerCommandsContext.Provider value={value}>
      {children}
    </PlayerCommandsContext.Provider>
  );
}

export function usePlayerCommandsRef(): MutableRefObject<PlayerCommands | null> {
  const ctx = useContext(PlayerCommandsContext);
  if (!ctx) {
    throw new Error("usePlayerCommandsRef requires PlayerCommandsProvider");
  }
  return ctx;
}

export function usePlayerCommands(): PlayerCommands {
  const ref = usePlayerCommandsRef();
  return useMemo(
    () => ({
      play: () => ref.current?.play(),
      pause: () => ref.current?.pause(),
      seekTo: (seconds) => ref.current?.seekTo(seconds),
      setVolume: (volume) => ref.current?.setVolume(volume),
      toggleMute: () => ref.current?.toggleMute(),
      toggleCaptions: () => ref.current?.toggleCaptions() ?? false,
      areCaptionsEnabled: () => ref.current?.areCaptionsEnabled() ?? false,
      getPlaybackRate: () => ref.current?.getPlaybackRate() ?? 1,
      setPlaybackRate: (rate) => ref.current?.setPlaybackRate(rate),
      getAvailablePlaybackRates: () =>
        ref.current?.getAvailablePlaybackRates() ?? [1],
      getPlaybackQuality: () => ref.current?.getPlaybackQuality() ?? "auto",
      setPlaybackQuality: (quality) => ref.current?.setPlaybackQuality(quality),
      getAvailableQualityLevels: () =>
        ref.current?.getAvailableQualityLevels() ?? [],
    }),
    [ref],
  );
}
