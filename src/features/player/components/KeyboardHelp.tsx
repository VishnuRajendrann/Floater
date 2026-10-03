import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PLAYER_SHORTCUT_LABELS } from "../../../keyboard/playerShortcuts";
import { PopoverPanel } from "../../../shared/ui/PopoverPanel";

type Anchor = { top: number; right: number };

export function KeyboardHelp() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const close = () => setOpen(false);

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    setAnchor({
      top: rect.bottom + 4,
      right: Math.max(8, window.innerWidth - rect.right),
    });
    setOpen(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="border-0 bg-transparent px-[var(--space-sm)] py-[var(--space-xs)] text-sm text-accent"
        aria-expanded={open}
        onClick={toggle}
      >
        Shortcuts
      </button>
      {open && anchor
        ? createPortal(
            <PopoverPanel
              className="fixed z-[80] min-w-56 rounded-md border border-border bg-surface-elevated p-[var(--space-md)] shadow-[0_8px_24px_rgb(0_0_0/0.35)]"
              closeClassName="w-full rounded-md border-0 bg-surface px-1.5 py-1.5 text-text"
              label="Keyboard shortcuts"
              onClose={close}
              style={{ top: anchor.top, right: anchor.right }}
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
            </PopoverPanel>,
            document.body,
          )
        : null}
    </>
  );
}
