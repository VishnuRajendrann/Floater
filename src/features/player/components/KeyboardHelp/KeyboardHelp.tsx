import { useState } from "react";
import { PLAYER_SHORTCUT_LABELS } from "../../../../keyboard/playerShortcuts";
import styles from "./KeyboardHelp.module.css";

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        Shortcuts
      </button>
      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Keyboard shortcuts">
          <ul className={styles.list}>
            {PLAYER_SHORTCUT_LABELS.map((item) => (
              <li key={item.keys}>
                <kbd>{item.keys}</kbd>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.close} onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      ) : null}
    </>
  );
}
