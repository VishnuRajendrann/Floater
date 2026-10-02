import { useCallback, useEffect, useRef, useState } from "react";
import { loadIframeApi } from "../../../integrations/youtube/loadIframeApi";
import { YoutubePlayerAdapter } from "../../../integrations/youtube/YoutubePlayerAdapter";
import { mapYoutubeErrorCode } from "../../../integrations/youtube/mapYoutubeErrorCode";
import { createAppError } from "../../../types/errors";
import { usePlayer } from "../../../state/player/playerContext";
import { usePlayerCommandsRef } from "../context/PlayerCommandsContext";
import { YT_PLAYER_STATE } from "../../../integrations/youtube/types";

const POLL_MS = 500;

export function useYoutubePlayer(videoId: string | null) {
  const { dispatch } = usePlayer();
  const commandsRef = usePlayerCommandsRef();
  const [mount, setMount] = useState<HTMLDivElement | null>(null);
  const adapterRef = useRef<YoutubePlayerAdapter | null>(null);
  const pollRef = useRef<number | null>(null);

  const mountRef = useCallback((node: HTMLDivElement | null) => {
    setMount(node);
  }, []);

  useEffect(() => {
    if (!videoId || !mount) {
      return;
    }

    let cancelled = false;

    dispatch({ type: "LOAD_STARTED", videoId });

    const stopPoll = () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const startPoll = () => {
      stopPoll();
      pollRef.current = window.setInterval(() => {
        const adapter = adapterRef.current;
        if (!adapter) {
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
        if (cancelled) {
          return;
        }
        dispatch({ type: "API_LOADED" });

        const adapter = new YoutubePlayerAdapter(mount, {
          onReady: () => {
            if (cancelled || !adapterRef.current) {
              return;
            }
            const duration = adapterRef.current.getDuration();
            const muted = adapterRef.current.isMuted();
            dispatch({
              type: "PLAYER_READY",
              duration: Number.isFinite(duration) ? duration : 0,
              volume: 100,
              muted,
            });
            startPoll();
          },
          onStateChange: (state) => {
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
            stopPoll();
            dispatch({ type: "PLAYER_ERROR", error: mapYoutubeErrorCode(code) });
          },
        });

        adapterRef.current = adapter;
        commandsRef.current = {
          play: () => adapter.play(),
          pause: () => adapter.pause(),
          seekTo: (seconds) => adapter.seekTo(seconds, true),
          setVolume: (volume) => adapter.setVolume(volume),
          toggleMute: () => {
            if (adapter.isMuted()) {
              adapter.unmute();
              dispatch({ type: "SET_MUTED", muted: false });
            } else {
              adapter.mute();
              dispatch({ type: "SET_MUTED", muted: true });
            }
          },
        };
        adapter.create(videoId);
      } catch (error) {
        if (!cancelled) {
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
  }, [videoId, mount, dispatch, commandsRef]);

  return mountRef;
}
