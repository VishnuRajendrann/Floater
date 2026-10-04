import { cn } from "../../shared/ui";
import type { ThemePreference } from "../../storage/preferencesStore";
import { usePreferences } from "../../state/preferences/preferencesContext";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

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

export function ThemeToggle() {
  const { preferences, setTheme } = usePreferences();

  return (
    <label className="flex items-center gap-[var(--space-sm)] text-sm">
      <span className="text-text-muted">Theme</span>
      <select
        className="rounded-md border border-border bg-surface px-2 py-1 text-text"
        value={preferences.theme}
        onChange={(event) => setTheme(event.target.value as ThemePreference)}
        aria-label="Theme preference"
      >
        {THEME_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
