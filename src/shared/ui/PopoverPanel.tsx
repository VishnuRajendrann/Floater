import type { ReactNode } from "react";

type Props = {
  className: string;
  closeClassName: string;
  label: string;
  onClose: () => void;
  children: ReactNode;
};

export function PopoverPanel({
  className,
  closeClassName,
  label,
  onClose,
  children,
}: Props) {
  return (
    <div className={className} role="dialog" aria-label={label}>
      {children}
      <button type="button" className={closeClassName} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
