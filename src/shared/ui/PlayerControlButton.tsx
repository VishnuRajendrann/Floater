import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function PlayerControlButton({
  active,
  className,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "player-control-btn",
        active && "player-control-btn-active",
        className,
      )}
      {...props}
    />
  );
}
