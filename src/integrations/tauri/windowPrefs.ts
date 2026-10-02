import { getCurrentWindow, LogicalPosition, LogicalSize } from "@tauri-apps/api/window";
import { isTauri } from "@tauri-apps/api/core";
import type { WindowBoundsPreference } from "../../storage/preferencesStore";

const RESIZE_DEBOUNCE_MS = 500;

export async function restoreWindowBounds(
  bounds: WindowBoundsPreference | undefined,
): Promise<void> {
  if (!isTauri() || !bounds) {
    return;
  }
  const appWindow = getCurrentWindow();
  await appWindow.setSize(new LogicalSize(bounds.width, bounds.height));
  if (typeof bounds.x === "number" && typeof bounds.y === "number") {
    await appWindow.setPosition(new LogicalPosition(bounds.x, bounds.y));
  }
}

export function watchWindowBounds(
  onBounds: (bounds: WindowBoundsPreference) => void,
): () => void {
  if (!isTauri()) {
    return () => {};
  }

  let timer: ReturnType<typeof globalThis.setTimeout> | null = null;
  const appWindow = getCurrentWindow();

  const emit = async () => {
    const size = await appWindow.innerSize();
    const scale = await appWindow.scaleFactor();
    const width = Math.round(size.width / scale);
    const height = Math.round(size.height / scale);
    let x: number | undefined;
    let y: number | undefined;
    try {
      const pos = await appWindow.outerPosition();
      x = Math.round(pos.x / scale);
      y = Math.round(pos.y / scale);
    } catch {
      // position may be unavailable on some platforms
    }
    onBounds({
      width,
      height,
      ...(x !== undefined && y !== undefined ? { x, y } : {}),
    });
  };

  const schedule = () => {
    if (timer !== null) {
      globalThis.clearTimeout(timer);
    }
    timer = globalThis.setTimeout(() => {
      timer = null;
      void emit();
    }, RESIZE_DEBOUNCE_MS);
  };

  const unlistenPromise = appWindow.onResized(() => {
    schedule();
  });

  return () => {
    if (timer !== null) {
      globalThis.clearTimeout(timer);
    }
    void unlistenPromise.then((unlisten) => unlisten());
  };
}
