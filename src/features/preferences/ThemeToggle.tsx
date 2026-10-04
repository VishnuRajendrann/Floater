import { usePreferences } from "../../state/preferences/preferencesContext";
import { resolveThemeClass } from "../../state/preferences/themeUtils";
import { cn } from "../../shared/lib/cn";

const iconMotion =
  "absolute inset-0 size-6 transition-[opacity,scale,rotate] duration-500 ease-in-out motion-reduce:transition-none";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { preferences, setTheme } = usePreferences();
  const isDark = resolveThemeClass(preferences.theme) !== "light";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full border-0 p-0 transition-colors duration-500 ease-in-out motion-reduce:transition-none",
        isDark
          ? "border-0 bg-accent text-white hover:bg-accent-hover"
          : "border-2 border-accent bg-transparent text-accent hover:text-accent-hover",
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className="relative block size-6">
        <SunIcon
          className={cn(
            iconMotion,
            "text-accent",
            isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
          )}
        />
        <MoonIcon
          className={cn(
            iconMotion,
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0",
          )}
        />
      </span>
    </button>
  );
}
