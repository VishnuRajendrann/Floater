const QUALITY_LABELS: Record<string, string> = {
  tiny: "144p",
  small: "240p",
  medium: "360p",
  large: "480p",
  hd720: "720p",
  hd1080: "1080p",
  highres: "1440p+",
  auto: "Auto",
};

export function formatPlaybackQuality(quality: string): string {
  return QUALITY_LABELS[quality] ?? quality;
}

export const DEFAULT_PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
