import { usePreferences } from "../../../state/preferences/preferencesContext";
import { cn } from "../../../lib/cn";

export function AlwaysOnTopToggle() {
  const { alwaysOnTopEnabled, setAlwaysOnTop } = usePreferences();
  const enabled = alwaysOnTopEnabled;

  return (
    <button
      type="button"
      className={cn(
        "rounded-md border border-border bg-surface px-2 py-1 text-sm whitespace-nowrap text-text-muted hover:text-text",
        enabled && "border-accent text-text",
      )}
      aria-label="Always on top"
      aria-pressed={enabled}
      onClick={() => setAlwaysOnTop(!enabled)}
    >
      {enabled ? "Always on Top ✓" : "Always on Top"}
    </button>
  );
}
