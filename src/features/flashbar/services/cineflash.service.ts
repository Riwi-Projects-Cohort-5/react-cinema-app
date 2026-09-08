import { httpClient } from "@services/httpClient";

import type { CineFlashResponse } from "@features/flashbar/interfaces/cineflash";

export async function getCineFlash(
  cityId: string,
  signal?: AbortSignal
): Promise<CineFlashResponse> {
  const { data } = await httpClient.get<CineFlashResponse>("/cineflash", {
    params: { cityId },
    signal,
  });
  return data;
}
