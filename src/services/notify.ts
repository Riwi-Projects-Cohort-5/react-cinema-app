import { toast } from "sonner";

import { ApiError } from "@services/api-error";

interface NotifyErrorOptions {
  title?: string;
  onRetry?: () => void;
}

function buildErrorDescription(error: ApiError): string {
  const parts = [
    error.message,
    error.retryAfterSeconds !== undefined ? `Reintenta en ${error.retryAfterSeconds} s` : undefined,
    error.requestId ? `ID: ${error.requestId}` : undefined,
  ].filter((part): part is string => part !== undefined);

  return parts.join(" · ");
}

function notifyWithRetry(
  message: string,
  description: string | undefined,
  onRetry: (() => void) | undefined
): void {
  toast.error(message, {
    description,
    action: onRetry ? { label: "Reintentar", onClick: onRetry } : undefined,
  });
}

export function notifyError(error: unknown, options: NotifyErrorOptions = {}): void {
  const title = options.title ?? "Ocurrió un error";

  if (error instanceof ApiError) {
    notifyWithRetry(title, buildErrorDescription(error), options.onRetry);
    return;
  }

  if (error instanceof Error) {
    notifyWithRetry(title, error.message, options.onRetry);
    return;
  }

  notifyWithRetry(title, undefined, options.onRetry);
}

export function notifySuccess(message: string, description?: string): void {
  toast.success(message, { description });
}

export function notifyInfo(message: string, description?: string): void {
  toast.info(message, { description });
}

export function notifyWarning(message: string, description?: string): void {
  toast.warning(message, { description });
}
