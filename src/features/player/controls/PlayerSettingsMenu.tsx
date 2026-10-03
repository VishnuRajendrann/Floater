import { useState } from "react";
import {
  DEFAULT_PLAYBACK_RATES,
  formatPlaybackQuality,
} from "../../../integrations/youtube/youtubePlaybackOptions";
import { usePlayerCommands } from "../context/PlayerCommandsContext";
import { PlayerControlButton } from "../../../shared/ui/PlayerControlButton";
import { PopoverPanel } from "../../../shared/ui/PopoverPanel";
import { IconSettings } from "./PlayerIcons";

type Props = { disabled?: boolean };

export function PlayerSettingsMenu({ disabled }: Props) {
  const commands = usePlayerCommands();
  const [open, setOpen] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [quality, setQualityState] = useState("auto");
  const [rates, setRates] = useState<number[]>(DEFAULT_PLAYBACK_RATES);
  const [qualities, setQualities] = useState<string[]>([]);

  const syncFromPlayer = () => {
    setPlaybackRateState(commands.getPlaybackRate());
    setQualityState(commands.getPlaybackQuality());
    const availableRates = commands.getAvailablePlaybackRates();
    setRates(
      availableRates.length > 0 ? availableRates : DEFAULT_PLAYBACK_RATES,
    );
    const availableQualities = commands.getAvailableQualityLevels();
    setQualities(availableQualities.length > 0 ? availableQualities : ["auto"]);
  };

  const handleToggle = () => {
    if (disabled) {
      return;
    }
    if (open) {
      setOpen(false);
      return;
    }
    syncFromPlayer();
    setOpen(true);
  };

  return (
    <div className="relative">
      <PlayerControlButton
        className="text-white/85"
        disabled={disabled}
        aria-expanded={open}
        aria-label="Playback settings"
        title="Speed and quality"
        onClick={handleToggle}
      >
        <IconSettings />
      </PlayerControlButton>
      {open ? (
        <PopoverPanel
          className="absolute right-0 bottom-[calc(100%+var(--space-sm))] z-[12] w-[min(16rem,70vw)] rounded-md border border-white/10 bg-[rgb(18_18_22/0.96)] p-[var(--space-md)] text-white shadow-[0_8px_24px_rgb(0_0_0/0.45)]"
          closeClassName="ui-filled w-full px-[var(--space-xs)] py-[var(--space-xs)]"
          label="Playback settings"
          onClose={() => setOpen(false)}
        >
          <label className="mb-[var(--space-sm)] flex flex-col gap-[var(--space-xs)]">
            <span className="text-xs text-white/65">Speed</span>
            <select
              className="ui-filled w-full px-[var(--space-sm)] py-[var(--space-xs)]"
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
          <label className="mb-[var(--space-sm)] flex flex-col gap-[var(--space-xs)]">
            <span className="text-xs text-white/65">Quality</span>
            <select
              className="ui-filled w-full px-[var(--space-sm)] py-[var(--space-xs)]"
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
          <p className="mb-[var(--space-sm)] text-[0.7rem] leading-snug text-white/55">
            Quality is limited by YouTube for embedded playback; Auto is recommended.
          </p>
        </PopoverPanel>
      ) : null}
    </div>
  );
}
