import type { ReactNode } from "react";

export type IconName =
  | "chef"
  | "check"
  | "chevron"
  | "clock"
  | "minus"
  | "plus"
  | "receipt"
  | "search"
  | "spark"
  | "trash"
  | "warning"
  | "x";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className = "" }: IconProps) {
  const paths: Record<IconName, ReactNode> = {
    chef: (
      <>
        <path d="M6.5 10.5c-2.8 0-3.5-4.2-.6-5.1A4.1 4.1 0 0 1 13 3.8a3.6 3.6 0 0 1 5.5 3c0 2-1.4 3.5-3.4 3.7" />
        <path d="M6.5 10v9h9v-9M6.5 15h9" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    minus: <path d="M6 12h12" />,
    plus: <path d="M12 5v14M5 12h14" />,
    receipt: (
      <>
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path d="M9 8h6M9 12h6" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    spark: (
      <>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <path d="m5.6 5.6 2 2m8.8 8.8 2 2m0-12.8-2 2M7.6 16.4l-2 2" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    warning: (
      <>
        <path d="M10.3 3.8 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    x: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {paths[name]}
    </svg>
  );
}
