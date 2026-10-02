import type { RefObject } from "react";
import { usePlayer } from "../../../../state/player/playerContext";
import { FullscreenButton } from "../../controls/FullscreenButton";
import { MuteButton } from "../../controls/MuteButton";
import { PlayPauseButton } from "../../controls/PlayPauseButton";
import { SeekBar } from "../../controls/SeekBar";
import { TimeDisplay } from "../../controls/TimeDisplay";
import { VolumeSlider } from "../../controls/VolumeSlider";
import styles from "./ControlBar.module.css";

type Props = {
  shellRef: RefObject<HTMLDivElement | null>;
};

export function ControlBar({ shellRef }: Props) {
  const { state } = usePlayer();
  const disabled = state.loadPhase !== "ready";

  return (
    <div className={styles.bar}>
      <PlayPauseButton disabled={disabled} />
      <TimeDisplay />
      <SeekBar disabled={disabled} />
      <VolumeSlider disabled={disabled} />
      <MuteButton disabled={disabled} />
      <FullscreenButton shellRef={shellRef} disabled={disabled} />
    </div>
  );
}
