import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export interface ButtonProps {
  children?: ReactNode;
  className?: string;
  icon?: IconName;
  iconSize?: number;
  label?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

/**
 * Botón accesible optimizado para interacción táctil de al menos 48px (Touch Target Ergonomics).
 */
export function Button({
  children,
  className = "",
  icon,
  iconSize = 20,
  label,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      aria-label={label}
      className={`button-base ${className}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </button>
  );
}
