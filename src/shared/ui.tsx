import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type PlayerControlButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function PlayerControlButton({
  active,
  className,
  type = "button",
  ...props
}: PlayerControlButtonProps) {
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

type PopoverPanelProps = {
  className: string;
  closeClassName: string;
  label: string;
  onClose: () => void;
  children: ReactNode;
  style?: CSSProperties;
};

export function PopoverPanel({
  className,
  closeClassName,
  label,
  onClose,
  children,
  style,
}: PopoverPanelProps) {
  return (
    <div className={className} style={style} role="dialog" aria-label={label}>
      {children}
      <button type="button" className={closeClassName} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
