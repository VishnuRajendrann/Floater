const SCRIPT_ID = "floater-youtube-iframe-api";
const LOAD_TIMEOUT_MS = 15_000;

let loadPromise: Promise<void> | null = null;

function waitForYoutubeApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (window.YT?.Player) {
        resolve();
        return;
      }
      if (Date.now() - started > LOAD_TIMEOUT_MS) {
        reject(new Error("YouTube IFrame API load timeout"));
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

export function loadIframeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      waitForYoutubeApi().then(resolve).catch(reject);
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load YouTube IFrame API script"));
    };

    document.body.appendChild(script);

    window.setTimeout(() => {
      if (!window.YT?.Player) {
        loadPromise = null;
        reject(new Error("YouTube IFrame API load timeout"));
      }
    }, LOAD_TIMEOUT_MS);
  });

  return loadPromise;
}
