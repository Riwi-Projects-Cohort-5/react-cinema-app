import { env } from "@config/env";
import { httpClient } from "@services/httpClient";
import { notifyWarning } from "@services/notify";

import type { CineFlashResponse } from "@features/flashbar/interfaces/cineflash";
import { getMockCineFlash } from "@features/flashbar/services/cineflash.mock";

function reportFallback(): void {
  notifyWarning(
    "Mostrando promoción de ejemplo",
    "No pudimos conectar con el servidor. Verás una referencia temporal hasta que se restablezca."
  );
}

async function withFallback<T>(
  request: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  if (env.enableMocks) {
    return fallback();
  }

  try {
    return await request();
  } catch (error) {
    console.error("Error cargando Cine Flash:", error);
    reportFallback();
    return fallback();
  }
}

export async function getCineFlash(
  cityId: string,
  signal?: AbortSignal
): Promise<CineFlashResponse> {
  return withFallback(async () => {
    const { data } = await httpClient.get<CineFlashResponse>("/cineflash", {
      params: { cityId },
      signal,
    });
    return data;
  }, () => getMockCineFlash(cityId));
}
