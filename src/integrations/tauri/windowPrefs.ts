import {

  availableMonitors,

  getCurrentWindow,

  LogicalPosition,

  LogicalSize,

} from "@tauri-apps/api/window";

import { isTauri } from "@tauri-apps/api/core";

import type { WindowBoundsPreference } from "../../storage/preferencesStore";



const RESIZE_DEBOUNCE_MS = 500;

/** Launch size from `tauri.conf.json`. The window opens at this size. */
export const DEFAULT_WINDOW_WIDTH = 512;
export const DEFAULT_WINDOW_HEIGHT = 382;

type WindowSize = { width: number; height: number };

const DEFAULT_WINDOW_SIZE: WindowSize = {
  width: DEFAULT_WINDOW_WIDTH,
  height: DEFAULT_WINDOW_HEIGHT,
};

/** Size the user dragged to while watching. Not updated by the toggle itself. */
let desiredSize: WindowSize | null = null;
let snappedToDefault = false;
let applyingSize = false;

async function readLogicalWindowSize(): Promise<WindowSize | null> {
  if (!isTauri()) {
    return null;
  }
  const appWindow = getCurrentWindow();
  const size = await appWindow.innerSize();
  const scale = await appWindow.scaleFactor();
  return {
    width: Math.round(size.width / scale),
    height: Math.round(size.height / scale),
  };
}

function rememberUserResize(size: WindowSize): void {
  if (applyingSize || snappedToDefault) {
    return;
  }
  desiredSize = size;
}

/** Called on real window resizes so the dragged size is kept before the toggle runs. */
export function noteUserWindowResize(): void {
  if (applyingSize || snappedToDefault || !isTauri()) {
    return;
  }
  void readLogicalWindowSize().then((size) => {
    if (size) {
      rememberUserResize(size);
    }
  });
}

async function applyWindowSize(size: WindowSize): Promise<void> {
  if (!isTauri()) {
    return;
  }
  applyingSize = true;
  try {
    await getCurrentWindow().setSize(new LogicalSize(size.width, size.height));
  } finally {
    globalThis.setTimeout(() => {
      applyingSize = false;
    }, RESIZE_DEBOUNCE_MS + 200);
  }
}

export async function applyDefaultWindowSize(): Promise<void> {
  await applyWindowSize(DEFAULT_WINDOW_SIZE);
}

function targetWindowSize(): WindowSize {
  if (snappedToDefault || !desiredSize) {
    return DEFAULT_WINDOW_SIZE;
  }
  return desiredSize;
}

/** First press snaps to the default size. The next press restores the dragged size. */
export async function togglePlayerWindowSize(): Promise<void> {
  if (!isTauri()) {
    return;
  }
  if (!snappedToDefault) {
    const current = (await readLogicalWindowSize()) ?? desiredSize;
    if (current) {
      desiredSize = current;
    }
  }
  snappedToDefault = !snappedToDefault || !desiredSize;
  if (!desiredSize) {
    snappedToDefault = true;
  }
  await applyWindowSize(targetWindowSize());
}

/** Re-apply after the title bar changes so that change cannot replace the target size. */
export async function reapplyPlayerWindowSize(): Promise<void> {
  if (!isTauri() || !desiredSize) {
    return;
  }
  await applyWindowSize(targetWindowSize());
}

const MIN_ON_SCREEN_AREA = 80 * 80;



export class AlwaysOnTopError extends Error {

  override name = "AlwaysOnTopError";



  constructor(

    message: string,

    readonly cause?: unknown,

  ) {

    super(message);

  }

}



function logAlwaysOnTopFailure(enabled: boolean, cause: unknown): void {

  if (import.meta.env.DEV) {

    console.error("[Floater] Native always-on-top failed", { enabled, cause });

  }

}



type Rect = { x: number; y: number; w: number; h: number };



function overlapArea(a: Rect, b: Rect): number {

  const xOverlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));

  const yOverlap = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

  return xOverlap * yOverlap;

}



function monitorWorkArea(monitor: Awaited<ReturnType<typeof availableMonitors>>[number]): Rect {

  const area = monitor.workArea;

  return {

    x: area.position.x,

    y: area.position.y,

    w: area.size.width,

    h: area.size.height,

  };

}



async function windowOuterRect(): Promise<Rect | null> {

  const appWindow = getCurrentWindow();

  try {

    const [size, pos] = await Promise.all([

      appWindow.outerSize(),

      appWindow.outerPosition(),

    ]);

    return { x: pos.x, y: pos.y, w: size.width, h: size.height };

  } catch {

    return null;

  }

}



async function isWindowOnAnyMonitor(): Promise<boolean> {

  const winRect = await windowOuterRect();

  if (!winRect) {

    return true;

  }

  const monitors = await availableMonitors();

  if (monitors.length === 0) {

    return false;

  }

  return monitors.some(

    (monitor) => overlapArea(winRect, monitorWorkArea(monitor)) >= MIN_ON_SCREEN_AREA,

  );

}



/** Show, unminimize, restore the title bar, and center if saved bounds are off-screen. */

export async function ensureWindowVisible(): Promise<void> {

  if (!isTauri()) {

    return;

  }

  const appWindow = getCurrentWindow();

  try {

    await appWindow.show();

    if (await appWindow.isMinimized()) {

      await appWindow.unminimize();

    }

    await appWindow.setDecorations(true);

    if (!(await isWindowOnAnyMonitor())) {

      await appWindow.center();

    }

    await appWindow.setFocus();

  } catch (cause) {

    if (import.meta.env.DEV) {

      console.error("[Floater] ensureWindowVisible failed", cause);

    }

  }

}



export async function applyAlwaysOnTop(enabled: boolean): Promise<void> {

  if (!isTauri()) {

    throw new AlwaysOnTopError(

      "Always on Top is only available in the Floater desktop app.",

    );

  }

  try {

    await getCurrentWindow().setAlwaysOnTop(enabled);

  } catch (cause) {

    logAlwaysOnTopFailure(enabled, cause);

    throw new AlwaysOnTopError(

      enabled

        ? "Could not enable Always on Top on the native window."

        : "Could not disable Always on Top on the native window.",

      cause,

    );

  }

}



export async function readNativeAlwaysOnTop(): Promise<boolean | null> {

  if (!isTauri()) {

    return null;

  }

  try {

    return await getCurrentWindow().isAlwaysOnTop();

  } catch (cause) {

    if (import.meta.env.DEV) {

      console.error("[Floater] isAlwaysOnTop failed", cause);

    }

    return null;

  }

}



export async function setWindowDecorations(enabled: boolean): Promise<void> {
  if (!isTauri()) {
    return;
  }
  const appWindow = getCurrentWindow();
  await appWindow.setDecorations(enabled);
  try {
    await appWindow.setShadow(!enabled);
  } catch {
    // Optional; browser dev has no native shadow.
  }
}

export async function startWindowDrag(): Promise<void> {
  if (!isTauri()) {
    return;
  }
  await getCurrentWindow().startDragging();
}



export async function restoreWindowPosition(
  bounds: WindowBoundsPreference | undefined,
): Promise<void> {
  if (
    !isTauri() ||
    !bounds ||
    typeof bounds.x !== "number" ||
    typeof bounds.y !== "number"
  ) {
    return;
  }
  await getCurrentWindow().setPosition(new LogicalPosition(bounds.x, bounds.y));
}

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

    noteUserWindowResize();

    schedule();

  });



  return () => {

    if (timer !== null) {

      globalThis.clearTimeout(timer);

    }

    void unlistenPromise.then((unlisten) => unlisten());

  };

}


