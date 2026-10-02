import { useEffect, useState } from "react";
import {
  DEFAULT_PLAYBACK_RATES,
  formatPlaybackQuality,
} from "../../../../integrations/youtube/youtubePlaybackOptions";
import { usePlayerCommands } from "../../context/PlayerCommandsContext";
import { IconSettings } from "../PlayerIcons";
import styles from "./PlayerSettingsMenu.module.css";

type Props = { disabled?: boolean };

export function PlayerSettingsMenu({ disabled }: Props) {
  const commands = usePlayerCommands();
  const [open, setOpen] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [quality, setQualityState] = useState("auto");
  const [rates, setRates] = useState<number[]>(DEFAULT_PLAYBACK_RATES);
  const [qualities, setQualities] = useState<string[]>([]);

  useEffect(() => {
    if (!open || disabled) {
      return;
    }
    setPlaybackRateState(commands.getPlaybackRate());
    setQualityState(commands.getPlaybackQuality());
    const availableRates = commands.getAvailablePlaybackRates();
    setRates(
      availableRates.length > 0 ? availableRates : DEFAULT_PLAYBACK_RATES,
    );
    const availableQualities = commands.getAvailableQualityLevels();
    setQualities(availableQualities.length > 0 ? availableQualities : ["auto"]);
  }, [open, disabled, commands]);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        disabled={disabled}
        aria-expanded={open}
        aria-label="Playback settings"
        title="Speed and quality"
        onClick={() => setOpen((value) => !value)}
      >
        <IconSettings />
      </button>
      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Playback settings">
          <label className={styles.field}>
            <span className={styles.label}>Speed</span>
            <select
              className={styles.select}
              value={String(playbackRate)}
              onChange={(event) => {
                const rate = Number(event.target.value);
                commands.setPlaybackRate(rate);
                setPlaybackRateState(rate);
              }}
            >
              {rates.map((rate) => (
                <option key={rate} value={rate}>
                  {rate === 1 ? "Normal" : `${rate}x`}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Quality</span>
            <select
              className={styles.select}
              value={quality}
              onChange={(event) => {
                const next = event.target.value;
                commands.setPlaybackQuality(next);
                setQualityState(next);
              }}
            >
              {qualities.map((level) => (
                <option key={level} value={level}>
                  {formatPlaybackQuality(level)}
                </option>
              ))}
            </select>
          </label>
          <p className={styles.note}>
            Quality is limited by YouTube for embedded playback; Auto is recommended.
          </p>
          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
