import { usePreferences } from "../../state/preferences/preferencesContext";
import { cn } from "../../shared/lib/cn";

export function AlwaysOnTopToggle() {
  const { alwaysOnTopEnabled, setAlwaysOnTop } = usePreferences();

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center rounded-md border-2 border-accent px-3 py-1.5 text-sm font-medium whitespace-nowrap text-white transition-colors duration-300 ease-in-out motion-reduce:transition-none",
        alwaysOnTopEnabled
          ? "float-bob bg-accent hover:bg-accent-hover"
          : "bg-transparent",
      )}
      aria-pressed={alwaysOnTopEnabled}
      onClick={() => setAlwaysOnTop(!alwaysOnTopEnabled)}
    >
      Float
    </button>
  );
}
