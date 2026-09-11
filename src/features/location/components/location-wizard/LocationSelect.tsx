import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";

import { Dropdown, type DropdownOption } from "@shared/components/primitives";

export type LocationSelectStatus = "idle" | "loading" | "error" | "empty" | "ready";

interface LocationSelectProps {
  label: string;
  placeholder: string;
  status: LocationSelectStatus;
  options: DropdownOption<number>[];
  value: number | null;
  onChange: (value: number | null) => void;
  onRetry: () => void;
  emptyMessage: string;
  errorMessage: string;
}

const STATUS_PLACEHOLDER: Record<Exclude<LocationSelectStatus, "idle" | "ready">, string> = {
  loading: "Cargando…",
  error: "No se pudo cargar",
  empty: "Sin opciones disponibles",
};

export function LocationSelect({
  label,
  placeholder,
  status,
  options,
  value,
  onChange,
  onRetry,
  emptyMessage,
  errorMessage,
}: LocationSelectProps) {
  const resolvedPlaceholder =
    status === "idle" || status === "ready" ? placeholder : STATUS_PLACEHOLDER[status];

  return (
    <div className="flex flex-col gap-1.5">
      <Dropdown<number>
        label={label}
        placeholder={resolvedPlaceholder}
        options={options}
        value={value}
        onChange={onChange}
        disabled={status !== "ready"}
      />

      {status === "empty" && (
        <p role="status" className="text-caption text-text-secondary">
          {emptyMessage}
        </p>
      )}

      {status === "error" && (
        <div role="alert" className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-caption text-error">
            <WarningCircle size={14} weight="fill" aria-hidden="true" className="shrink-0" />
            {errorMessage}
          </span>
          <button
            type="button"
            onClick={onRetry}
            className="flex shrink-0 items-center gap-1 rounded-xs text-caption font-semibold text-primary transition-colors duration-fast hover:text-primary-hover"
          >
            <ArrowClockwise size={14} weight="bold" aria-hidden="true" />
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
