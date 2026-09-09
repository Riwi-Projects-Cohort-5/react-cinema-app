import { Clock } from "@phosphor-icons/react";

import { cn } from "@shared/utils/cn";

import { useCountdown } from "@shared/hooks/useCountdown";

interface CountdownProps {
  seconds: number;
  onExpire?: () => void;
  className?: string;
}

export function Countdown({ seconds, onExpire, className }: CountdownProps) {
  const { formatted } = useCountdown(seconds, { onExpire });

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-primary text-caption font-semibold tabular-nums tracking-wide text-text-primary",
        className
      )}
    >
      <Clock
        size={16}
        weight="regular"
        className="shrink-0 text-text-secondary"
        aria-hidden="true"
      />
      <span>{formatted}</span>
    </span>
  );
}
