export function PlayerWindowDragBand() {
  return (
    <div
      className="tauri-drag absolute top-0 right-0 left-0 z-[15] h-5 cursor-grab active:cursor-grabbing"
      aria-hidden
      data-tauri-drag-region
    />
  );
}
