import { useState } from "react";
import { PLAYER_SHORTCUT_LABELS } from "../../../keyboard/playerShortcuts";
import { PopoverPanel } from "../../../shared/ui/PopoverPanel";

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="border-0 bg-transparent px-[var(--space-sm)] py-[var(--space-xs)] text-sm text-accent"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Shortcuts
      </button>
      {open ? (
        <PopoverPanel
          className="absolute top-full right-0 z-10 mt-[var(--space-xs)] min-w-56 rounded-md border border-border bg-surface-elevated p-[var(--space-md)] shadow-[0_8px_24px_rgb(0_0_0/0.35)]"
          closeClassName="w-full rounded-md border-0 bg-surface px-1.5 py-1.5 text-text"
          label="Keyboard shortcuts"
          onClose={() => setOpen(false)}
        >
          <ul className="m-0 mb-[var(--space-sm)] grid list-none gap-[var(--space-sm)] p-0">
            {PLAYER_SHORTCUT_LABELS.map((item) => (
              <li
                key={item.keys}
                className="flex items-center justify-between gap-[var(--space-md)] text-sm"
              >
                <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-[inherit]">
                  {item.keys}
                </kbd>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </PopoverPanel>
      ) : null}
    </div>
  );
}
