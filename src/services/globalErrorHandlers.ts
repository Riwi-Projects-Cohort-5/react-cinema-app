import { notifyError } from "@services/notify";

function toError(reason: unknown, fallbackMessage: string): Error {
  if (reason instanceof Error) {
    return reason;
  }

  return new Error(fallbackMessage);
}

export function registerGlobalErrorHandlers(): void {
  window.addEventListener("error", (event) => {
    const error = toError(event.error, event.message || "Error inesperado");
    console.error("Uncaught error:", error);
    notifyError(error, { title: "Error inesperado" });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const error = toError(event.reason, "Promesa rechazada sin manejar");
    console.error("Unhandled promise rejection:", error);
    notifyError(error, { title: "Error inesperado" });
  });
}
