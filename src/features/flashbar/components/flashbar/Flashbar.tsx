import {
  CheckCircle,
  Info,
  Lightning,
  Warning,
  WarningCircle,
  X,
  type Icon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { cn } from "@shared/utils/cn";

import { Countdown, IconBadge, IconLink } from "@shared/components/primitives";

export type FlashbarTone = "accent" | "success" | "info" | "warning" | "error";

const TONE_TEXT: Record<FlashbarTone, string> = {
  accent: "text-accent",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  error: "text-error",
};

const TONE_BORDER_Y: Record<FlashbarTone, string> = {
  accent: "border-y-accent",
  success: "border-y-success",
  info: "border-y-info",
  warning: "border-y-warning",
  error: "border-y-error",
};

const TONE_BORDER_LEFT: Record<FlashbarTone, string> = {
  accent: "border-l-accent",
  success: "border-l-success",
  info: "border-l-info",
  warning: "border-l-warning",
  error: "border-l-error",
};

const TONE_BADGE: Record<FlashbarTone, string> = {
  accent: "border-accent/20 bg-accent/12",
  success: "border-success/20 bg-success/12",
  info: "border-info/20 bg-info/12",
  warning: "border-warning/20 bg-warning/12",
  error: "border-error/20 bg-error/12",
};

const TONE_ICONS: Record<FlashbarTone, Icon> = {
  accent: Lightning,
  success: CheckCircle,
  info: Info,
  warning: Warning,
  error: WarningCircle,
};

interface FlashbarProps {
  title: string;
  message: string;
  icon?: ReactNode;
  countdownSeconds?: number;
  onCountdownExpire?: () => void;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  tone?: FlashbarTone;
  fixed?: boolean;
  className?: string;
}

export function Flashbar({
  title,
  message,
  icon,
  countdownSeconds,
  onCountdownExpire,
  actionLabel,
  actionTo,
  onAction,
  onDismiss,
  tone = "accent",
  fixed = true,
  className,
}: FlashbarProps) {
  const ToneIcon = TONE_ICONS[tone];

  return (
    <aside
      role={tone === "error" ? "alert" : "status"}
      aria-label={title}
      className={cn(
        "flex h-14 items-center gap-4 overflow-hidden border-y border-l-[3px] bg-surface px-4 lg:px-16",
        TONE_BORDER_Y[tone],
        TONE_BORDER_LEFT[tone],
        fixed ? "fixed inset-x-0 top-0 z-50" : "relative",
        className
      )}
    >
      <IconBadge
        className={TONE_BADGE[tone]}
        icon={
          icon ?? (
            <ToneIcon size={16} weight="bold" className={TONE_TEXT[tone]} aria-hidden="true" />
          )
        }
      />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={cn(
            "shrink-0 font-primary text-sm font-semibold leading-[1.3125rem]",
            TONE_TEXT[tone]
          )}
        >
          {title}
        </span>
        <span className="h-3.5 w-px shrink-0 bg-border" aria-hidden="true" />
        <span className="truncate font-secondary text-sm leading-[1.3125rem] text-text-secondary">
          {message}
        </span>

        {countdownSeconds !== undefined && (
          <span className="ml-auto hidden shrink-0 items-center rounded-md border border-border bg-surface-variant px-2 md:inline-flex">
            <Countdown seconds={countdownSeconds} onExpire={onCountdownExpire} />
          </span>
        )}
      </div>

      {actionLabel &&
        (actionTo || onAction) &&
        (actionTo ? (
          <IconLink to={actionTo} className="shrink-0">
            {actionLabel}
          </IconLink>
        ) : (
          <IconLink onClick={() => onAction?.()} className="shrink-0">
            {actionLabel}
          </IconLink>
        ))}

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar aviso"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors duration-fast hover:bg-surface-variant hover:text-text-primary"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
