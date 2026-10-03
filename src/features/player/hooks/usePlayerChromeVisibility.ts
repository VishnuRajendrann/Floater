import { useCallback, useEffect, useRef, useState } from "react";
import {
  ensureWindowVisible,
  setWindowDecorations,
} from "../../../integrations/tauri/windowPrefs";

export function usePlayerChromeVisibility() {
  const [controlsVisible, setControlsVisible] = useState(false);
  const [revealerVisible, setRevealerVisible] = useState(false);
  const pointerInsideRef = useRef(false);

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
    pointerInsideRef.current = true;
    setRevealerVisible(true);
  }, []);

  const onShellPointerLeave = useCallback(() => {
    pointerInsideRef.current = false;
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
