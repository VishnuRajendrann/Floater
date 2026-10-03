import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { YT_PLAYER_STATE } from "../../../integrations/youtube/types";
import { startWindowDrag } from "../../../integrations/tauri/windowPrefs";
import { usePlayerCommands } from "../context/PlayerCommandsContext";
import { usePlayerMeta } from "../../../state/player/playerContext";

const DRAG_THRESHOLD_PX = 6;

type Options = {
  enabled: boolean;
};

export function useImmersiveVideoPointer({ enabled }: Options) {
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
