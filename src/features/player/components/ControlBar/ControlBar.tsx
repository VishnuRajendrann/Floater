import type { RefObject } from "react";
import { usePlayerMeta } from "../../../../state/player/playerContext";
import { FullscreenButton } from "../../controls/FullscreenButton";
import { MuteButton } from "../../controls/MuteButton";
import { PlayPauseButton } from "../../controls/PlayPauseButton";
import { SeekBar } from "../../controls/SeekBar";
import { TimeDisplay } from "../../controls/TimeDisplay";
import { VolumeSlider } from "../../controls/VolumeSlider";
import styles from "./ControlBar.module.css";

type Props = {
  shellRef: RefObject<HTMLDivElement | null>;
  visible: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onPointerDown: () => void;
  onPointerUp: () => void;
};

export function ControlBar({
  shellRef,
  visible,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
}: Props) {
  const { loadPhase } = usePlayerMeta();
  const disabled = loadPhase !== "ready";

  return (
    <div
      className={`${styles.bar} ${visible ? "" : styles.hidden}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <PlayPauseButton disabled={disabled} />
      <TimeDisplay />
      <SeekBar disabled={disabled} />
      <VolumeSlider disabled={disabled} />
      <MuteButton disabled={disabled} />
      <FullscreenButton shellRef={shellRef} disabled={disabled} />
    </div>
  );
}
