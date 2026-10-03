import { usePreferences } from "../../../state/preferences/preferencesContext";
import type { ThemePreference } from "../../../storage/preferencesStore";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

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
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
