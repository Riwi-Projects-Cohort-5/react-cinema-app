import type { ReactNode } from "react";

import { cn } from "@shared/utils/cn";

interface IconBadgeProps {
  icon: ReactNode;
  className?: string;
}

export function IconBadge({ icon, className }: IconBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-accent/12",
        className
      )}
    >
      {icon}
    </span>
  );
}
