import { PREFERENCES_STORAGE_KEY } from "./preferencesStore";
import { RECENT_VIDEOS_STORAGE_KEY } from "./recentVideosStore";

/** Removes Floater preference and recent-video keys from local storage. */
export function resetLocalData(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.removeItem(PREFERENCES_STORAGE_KEY);
  localStorage.removeItem(RECENT_VIDEOS_STORAGE_KEY);
}
