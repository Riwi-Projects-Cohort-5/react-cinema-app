import { httpClient } from "@services/httpClient";

import type { HealthResponse } from "@features/health/interfaces/health";

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const { data } = await httpClient.get<HealthResponse>("/health", { signal });
  return data;
}
