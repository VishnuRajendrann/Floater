import { usePreferences } from "../../../state/preferences/preferencesContext";
import type { ThemePreference } from "../../../storage/preferencesStore";
import styles from "./ThemeToggle.module.css";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export function ThemeToggle() {
  const { preferences, setTheme } = usePreferences();

  return (
    <label className={styles.wrap}>
      <span className={styles.label}>Theme</span>
      <select
        className={styles.select}
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
