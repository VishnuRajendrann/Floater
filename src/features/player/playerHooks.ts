import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { mapYoutubeErrorCode, YT_PLAYER_STATE } from "../../integrations/youtube/youtubeCore";
import {
  loadIframeApi,
  resetIframeApiLoadState,
  YoutubePlayerAdapter,
} from "../../integrations/youtube/youtubeRuntime";
import { createAppError } from "../../types/errors";
import { loadPreferences } from "../../storage/preferencesStore";
import {
  usePlayerDispatch,
  usePlayerMeta,
  usePlayerProgress,
} from "../../state/player/playerContext";
import { usePlayerCommands, usePlayerCommandsRef } from "./PlayerCommandsContext";
import { usePreferences } from "../../state/preferences/preferencesContext";
import {
  ensureWindowVisible,
  setWindowDecorations,
  startWindowDrag,
} from "../../integrations/tauri/windowPrefs";
import { isEditableTarget, runPlayerShortcut } from "../../keyboard/playerShortcuts";

export function usePlayerChromeVisibility() {
  const [controlsVisible, setControlsVisible] = useState(false);
  const [revealerVisible, setRevealerVisible] = useState(false);

  const applyDecorations = useCallback((visible: boolean) => {
    void (async () => {
      try {
        if (!visible) {
          await ensureWindowVisible();
        }
        await setWindowDecorations(visible);
      } catch {
        // Best-effort; browser dev has no native decorations.
      }
    })();
  }, []);

  useEffect(() => {
    applyDecorations(false);
    return () => {
      void ensureWindowVisible();
    };
  }, [applyDecorations]);

  const toggleControls = useCallback(() => {
    setControlsVisible((prev) => {
      const next = !prev;
      applyDecorations(next);
      return next;
    });
  }, [applyDecorations]);

  const onShellPointerEnter = useCallback(() => {
    setRevealerVisible(true);
  }, []);

  const onShellPointerLeave = useCallback(() => {
    setRevealerVisible(false);
  }, []);

  const onRevealerPointerEnter = useCallback(() => {
    setRevealerVisible(true);
  }, []);

  return {
    controlsVisible,
    revealerVisible,
    toggleControls,
    onShellPointerEnter,
    onShellPointerLeave,
    onRevealerPointerEnter,
  };
}

type KeyboardShortcutOptions = {
  enabled: boolean;
  onActivity?: () => void;
};

export function usePlayerKeyboardShortcuts({
  enabled,
  onActivity,
}: KeyboardShortcutOptions) {
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

const DRAG_THRESHOLD_PX = 6;

type ImmersivePointerOptions = {
  enabled: boolean;
};

export function useImmersiveVideoPointer({ enabled }: ImmersivePointerOptions) {
  const commands = usePlayerCommands();
  const { ytState } = usePlayerMeta();
  const gestureRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    dragging: boolean;
  } | null>(null);

  const onShieldPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || event.button !== 0) {
        return;
      }
      event.stopPropagation();
      gestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        dragging: false,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [enabled],
  );

  const onShieldPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const gesture = gestureRef.current;
      if (!enabled || !gesture || gesture.pointerId !== event.pointerId) {
        return;
      }
      event.stopPropagation();
      if (gesture.dragging) {
        return;
      }
      const dx = event.clientX - gesture.startX;
      const dy = event.clientY - gesture.startY;
      if (dx * dx + dy * dy >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
        gesture.dragging = true;
        void startWindowDrag().catch(() => {});
      }
    },
    [enabled],
  );

  const finishGesture = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const gesture = gestureRef.current;
      if (!gesture || gesture.pointerId !== event.pointerId) {
        return;
      }
      event.stopPropagation();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (!gesture.dragging && enabled) {
        if (ytState === YT_PLAYER_STATE.PLAYING) {
          commands.pause();
        } else {
          commands.play();
        }
      }
      gestureRef.current = null;
    },
    [commands, enabled, ytState],
  );

  const onShieldPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      finishGesture(event);
    },
    [finishGesture],
  );

  const onShieldPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      finishGesture(event);
    },
    [finishGesture],
  );

  return {
    onShieldPointerDown,
    onShieldPointerMove,
    onShieldPointerUp,
    onShieldPointerCancel,
  };
}

const POLL_MS = 500;

export function useYoutubePlayer(videoId: string | null) {
  const { loadGeneration } = usePlayerMeta();
  const dispatch = usePlayerDispatch();
  const { preferences, setVolume: persistVolume, setMuted: persistMuted } =
    usePreferences();
  const commandsRef = usePlayerCommandsRef();
  const [mount, setMount] = useState<HTMLDivElement | null>(null);
  const adapterRef = useRef<YoutubePlayerAdapter | null>(null);
  const pollRef = useRef<number | null>(null);
  const effectIdRef = useRef(0);
  const prefsRef = useRef(preferences);
  useEffect(() => {
    prefsRef.current = preferences;
  }, [preferences]);

  const mountRef = useCallback((node: HTMLDivElement | null) => {
    setMount(node);
  }, []);

  useEffect(() => {
    if (!videoId) {
      return;
    }
    dispatch({ type: "LOAD_STARTED", videoId });
  }, [videoId, dispatch]);

  useEffect(() => {
    if (!videoId || !mount) {
      return;
    }

    const effectId = ++effectIdRef.current;
    let cancelled = false;

    const stopPoll = () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const isActive = () => !cancelled && effectIdRef.current === effectId;

    const startPoll = () => {
      stopPoll();
      pollRef.current = window.setInterval(() => {
        const adapter = adapterRef.current;
        if (!adapter || !isActive()) {
          return;
        }
        dispatch({
          type: "TIME_TICK",
          currentTime: adapter.getCurrentTime(),
          duration: adapter.getDuration(),
        });
      }, POLL_MS);
    };

    void (async () => {
      try {
        await loadIframeApi();
        if (!isActive()) {
          return;
        }
        dispatch({ type: "API_LOADED" });

        const adapter = new YoutubePlayerAdapter(mount, {
          onReady: () => {
            if (!isActive() || !adapterRef.current) {
              return;
            }
            const prefs = prefsRef.current ?? loadPreferences();
            const targetVolume = prefs.muted ? 0 : prefs.volume;
            adapterRef.current.setVolume(targetVolume);
            if (prefs.muted) {
              adapterRef.current.mute();
            } else {
              adapterRef.current.unmute();
            }
            adapterRef.current.prepareCaptionsModule();

            const duration = adapterRef.current.getDuration();
            const muted = adapterRef.current.isMuted();
            dispatch({
              type: "PLAYER_READY",
              duration: Number.isFinite(duration) ? duration : 0,
              volume: prefs.muted ? 0 : prefs.volume,
              muted,
            });
            startPoll();
          },
          onStateChange: (state) => {
            if (!isActive()) {
              return;
            }
            dispatch({ type: "YT_STATE_CHANGE", ytState: state });
            if (state === YT_PLAYER_STATE.PLAYING) {
              startPoll();
            }
            if (
              state === YT_PLAYER_STATE.PAUSED ||
              state === YT_PLAYER_STATE.ENDED
            ) {
              stopPoll();
              const current = adapterRef.current;
              if (current) {
                dispatch({
                  type: "TIME_TICK",
                  currentTime: current.getCurrentTime(),
                  duration: current.getDuration(),
                });
              }
            }
          },
          onError: (code) => {
            if (!isActive()) {
              return;
            }
            stopPoll();
            dispatch({ type: "PLAYER_ERROR", error: mapYoutubeErrorCode(code) });
          },
        });

        adapterRef.current = adapter;
        commandsRef.current = {
          play: () => adapter.play(),
          pause: () => adapter.pause(),
          seekTo: (seconds) => adapter.seekTo(seconds, true),
          setVolume: (volume) => {
            adapter.setVolume(volume);
            persistVolume(volume);
          },
          toggleMute: () => {
            if (adapter.isMuted()) {
              adapter.unmute();
              dispatch({ type: "SET_MUTED", muted: false });
              persistMuted(false);
            } else {
              adapter.mute();
              dispatch({ type: "SET_MUTED", muted: true });
              persistMuted(true);
            }
          },
          toggleCaptions: () => adapter.toggleCaptions(),
          setCaptions: (enabled) => {
            adapter.setCaptionsEnabled(enabled);
          },
          areCaptionsEnabled: () => adapter.areCaptionsEnabled(),
          getPlaybackRate: () => adapter.getPlaybackRate(),
          setPlaybackRate: (rate) => adapter.setPlaybackRate(rate),
          getAvailablePlaybackRates: () => adapter.getAvailablePlaybackRates(),
          getPlaybackQuality: () => adapter.getPlaybackQuality(),
          setPlaybackQuality: (quality) => adapter.setPlaybackQuality(quality),
          getAvailableQualityLevels: () => adapter.getAvailableQualityLevels(),
        };
        adapter.create(videoId);
      } catch (error) {
        if (isActive()) {
          resetIframeApiLoadState();
          dispatch({
            type: "PLAYER_ERROR",
            error: createAppError(
              "API_LOAD_FAILED",
              error instanceof Error ? error.message : undefined,
            ),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      stopPoll();
      adapterRef.current?.destroy();
      adapterRef.current = null;
      commandsRef.current = null;
      mount.replaceChildren();
    };
  }, [
    videoId,
    mount,
    loadGeneration,
    dispatch,
    commandsRef,
    persistVolume,
    persistMuted,
  ]);

  return mountRef;
}
