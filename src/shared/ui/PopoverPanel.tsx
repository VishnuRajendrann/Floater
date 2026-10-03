import type { CSSProperties, ReactNode } from "react";

type Props = {
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
}: Props) {
  return (
    <div className={className} style={style} role="dialog" aria-label={label}>
      {children}
      <button type="button" className={closeClassName} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
