import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  initialPlayerState,
  playerReducer,
  type PlayerAction,
  type PlayerModel,
} from "./playerTypes";

type PlayerDispatchContextValue = Dispatch<PlayerAction>;

export type PlayerProgressModel = Pick<
  PlayerModel,
  "currentTime" | "duration" | "isSeeking"
>;

export type PlayerMetaModel = Omit<
  PlayerModel,
  "currentTime" | "duration" | "isSeeking"
>;

const PlayerProgressContext = createContext<PlayerProgressModel | null>(null);
const PlayerMetaContext = createContext<PlayerMetaModel | null>(null);
const PlayerDispatchContext = createContext<PlayerDispatchContextValue | null>(
  null,
);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);

  const progress = useMemo(
    () => ({
      currentTime: state.currentTime,
      duration: state.duration,
      isSeeking: state.isSeeking,
    }),
    [state.currentTime, state.duration, state.isSeeking],
  );

  const meta = useMemo(
    () => ({
      loadPhase: state.loadPhase,
      videoId: state.videoId,
      loadGeneration: state.loadGeneration,
      ytState: state.ytState,
      volume: state.volume,
      muted: state.muted,
      isFullscreen: state.isFullscreen,
      error: state.error,
    }),
    [
      state.loadPhase,
      state.videoId,
      state.loadGeneration,
      state.ytState,
      state.volume,
      state.muted,
      state.isFullscreen,
      state.error,
    ],
  );

  return (
    <PlayerMetaContext.Provider value={meta}>
      <PlayerProgressContext.Provider value={progress}>
        <PlayerDispatchContext.Provider value={dispatch}>
          {children}
        </PlayerDispatchContext.Provider>
      </PlayerProgressContext.Provider>
    </PlayerMetaContext.Provider>
  );
}

export function usePlayerProgress(): PlayerProgressModel {
  const ctx = useContext(PlayerProgressContext);
  if (!ctx) {
    throw new Error("usePlayerProgress must be used within PlayerProvider");
  }
  return ctx;
}

export function usePlayerMeta(): PlayerMetaModel {
  const ctx = useContext(PlayerMetaContext);
  if (!ctx) {
    throw new Error("usePlayerMeta must be used within PlayerProvider");
  }
  return ctx;
}

export function usePlayerState(): PlayerModel {
  const progress = usePlayerProgress();
  const meta = usePlayerMeta();
  return useMemo(
    () => ({ ...meta, ...progress }),
    [meta, progress],
  );
}

export function usePlayerDispatch(): PlayerDispatchContextValue {
  const ctx = useContext(PlayerDispatchContext);
  if (!ctx) {
    throw new Error("usePlayerDispatch must be used within PlayerProvider");
  }
  return ctx;
}

export function usePlayer(): {
  state: PlayerModel;
  dispatch: PlayerDispatchContextValue;
} {
  const state = usePlayerState();
  const dispatch = usePlayerDispatch();
  return useMemo(() => ({ state, dispatch }), [state, dispatch]);
}
