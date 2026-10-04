import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { AppError } from "../../types/errors";

export type LoadPhase =
  | "idle"
  | "loadingApi"
  | "loadingPlayer"
  | "ready"
  | "error";

export type PlayerModel = {
  loadPhase: LoadPhase;
  videoId: string | null;
  loadGeneration: number;
  ytState: number | null;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  isFullscreen: boolean;
  error: AppError | null;
  isSeeking: boolean;
};

export const initialPlayerState: PlayerModel = {
  loadPhase: "idle",
  videoId: null,
  loadGeneration: 0,
  ytState: null,
  currentTime: 0,
  duration: 0,
  volume: 100,
  muted: false,
  isFullscreen: false,
  error: null,
  isSeeking: false,
};

export type PlayerAction =
  | { type: "LOAD_STARTED"; videoId: string }
  | { type: "API_LOADED" }
  | { type: "PLAYER_READY"; duration: number; volume: number; muted: boolean }
  | { type: "YT_STATE_CHANGE"; ytState: number }
  | { type: "TIME_TICK"; currentTime: number; duration: number }
  | { type: "SEEK_START" }
  | { type: "SEEK_END"; currentTime: number }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "SET_MUTED"; muted: boolean }
  | { type: "SET_FULLSCREEN"; isFullscreen: boolean }
  | { type: "PLAYER_ERROR"; error: AppError }
  | { type: "RETRY" }
  | { type: "RESET" };

export function playerReducer(
  state: PlayerModel,
  action: PlayerAction,
): PlayerModel {
  switch (action.type) {
    case "LOAD_STARTED":
      return {
        ...initialPlayerState,
        loadPhase: "loadingApi",
        videoId: action.videoId,
        loadGeneration: 0,
      };
    case "API_LOADED":
      return { ...state, loadPhase: "loadingPlayer" };
    case "PLAYER_READY":
      return {
        ...state,
        loadPhase: "ready",
        duration: action.duration,
        volume: action.volume,
        muted: action.muted,
      };
    case "YT_STATE_CHANGE":
      return { ...state, ytState: action.ytState };
    case "TIME_TICK":
      if (state.isSeeking) {
        return state;
      }
      return {
        ...state,
        currentTime: action.currentTime,
        duration: action.duration || state.duration,
      };
    case "SEEK_START":
      return { ...state, isSeeking: true };
    case "SEEK_END":
      return {
        ...state,
        isSeeking: false,
        currentTime: action.currentTime,
      };
    case "SET_VOLUME":
      return { ...state, volume: action.volume, muted: false };
    case "SET_MUTED":
      return { ...state, muted: action.muted };
    case "SET_FULLSCREEN":
      return { ...state, isFullscreen: action.isFullscreen };
    case "PLAYER_ERROR":
      return {
        ...state,
        loadPhase: "error",
        error: action.error,
      };
    case "RETRY":
      if (!state.videoId) {
        return state;
      }
      return {
        ...initialPlayerState,
        loadPhase: "loadingApi",
        videoId: state.videoId,
        loadGeneration: state.loadGeneration + 1,
      };
    case "RESET":
      return initialPlayerState;
    default:
      return state;
  }
}

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
