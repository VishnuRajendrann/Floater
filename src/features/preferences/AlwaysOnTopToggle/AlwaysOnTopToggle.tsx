import { usePreferences } from "../../../state/preferences/preferencesContext";
import styles from "./AlwaysOnTopToggle.module.css";

export function AlwaysOnTopToggle() {
  const { alwaysOnTopEnabled, setAlwaysOnTop } = usePreferences();
  const enabled = alwaysOnTopEnabled;

  return (
    <button
      type="button"
      className={`${styles.button} ${enabled ? styles.on : ""}`}
      aria-label="Always on top"
      aria-pressed={enabled}
      onClick={() => setAlwaysOnTop(!enabled)}
    >
      {enabled ? "Always on Top ✓" : "Always on Top"}
    </button>
  );
}
