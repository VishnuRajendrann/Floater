import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadIframeApi,
  resetIframeApiLoadState,
} from "../../../integrations/youtube/loadIframeApi";
import { YoutubePlayerAdapter } from "../../../integrations/youtube/YoutubePlayerAdapter";
import { mapYoutubeErrorCode } from "../../../integrations/youtube/mapYoutubeErrorCode";
import { createAppError } from "../../../types/errors";
import { loadPreferences } from "../../../storage/preferencesStore";
import { usePlayerDispatch, usePlayerMeta } from "../../../state/player/playerContext";
import { usePlayerCommandsRef } from "../context/PlayerCommandsContext";
import { usePreferences } from "../../../state/preferences/preferencesContext";
import { YT_PLAYER_STATE } from "../../../integrations/youtube/types";

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
