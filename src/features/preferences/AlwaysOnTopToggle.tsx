import { usePreferences } from "../../state/preferences/preferencesContext";
import { cn } from "../../shared/lib/cn";

export function AlwaysOnTopToggle() {
  const { alwaysOnTopEnabled, setAlwaysOnTop } = usePreferences();

  return (
    <button
      type="button"
      className={cn(
        "rounded-md border border-border bg-surface px-2 py-1 text-sm whitespace-nowrap text-text-muted hover:text-text",
        alwaysOnTopEnabled && "border-accent text-text",
      )}
      aria-label="Always on top"
      aria-pressed={alwaysOnTopEnabled}
      onClick={() => setAlwaysOnTop(!alwaysOnTopEnabled)}
    >
      {alwaysOnTopEnabled ? "Always on Top ✓" : "Always on Top"}
    </button>
  );
}
