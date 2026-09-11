import { env } from "@config/env";
import { ApiError } from "@services/api-error";
import { httpClient } from "@services/httpClient";
import { notifyWarning } from "@services/notify";

import {
  getMockCities,
  getMockCountries,
  getMockDepartments,
} from "@features/location/services/location.mock";
import { useLocationSourceStore } from "@features/location/store/locationSourceStore";

import type { City, Country, Department } from "@shared/interfaces";

// TODO(MULT-19): la API envuelve TODAS sus respuestas en { success, data } (los 57 endpoints).
// Hoy se desenvuelve aquí, dentro de la feature, para no tocar `httpClient` sin coordinar con el
// equipo. Debe moverse a un interceptor compartido para que cada feature no repita esto.
// Ver docs/api/00-conventions.md §5.
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

const MALFORMED_RESPONSE = "MALFORMED_RESPONSE";

function unwrapList<T>(envelope: ApiEnvelope<T[]> | undefined): T[] {
  if (!envelope || envelope.success !== true || !Array.isArray(envelope.data)) {
    throw new ApiError("La respuesta de ubicación no tiene el formato esperado", {
      code: MALFORMED_RESPONSE,
    });
  }

  return envelope.data;
}

// El respaldo cubre "la API no está disponible": red caída, 5xx o una respuesta inservible.
// Un 4xx es un problema real de contrato y debe seguir mostrándose como error reintentable.
function isApiUnavailable(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.isCanceled) {
    return false;
  }

  return error.isNetwork || error.code === MALFORMED_RESPONSE || (error.status ?? 0) >= 500;
}

function reportFallback(): void {
  const { isUsingFallback, markFallback } = useLocationSourceStore.getState();
  markFallback();

  if (isUsingFallback) return;

  notifyWarning(
    "Mostrando ubicaciones de ejemplo",
    "No pudimos conectar con el servidor. Verás una lista de referencia hasta que se restablezca."
  );
}

async function withFallback<T>(
  request: () => Promise<T[]>,
  fallback: () => Promise<T[]>
): Promise<T[]> {
  if (env.enableMocks) {
    useLocationSourceStore.getState().markFallback();
    return fallback();
  }

  try {
    return await request();
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;

    reportFallback();
    return fallback();
  }
}

export async function getCountries(signal?: AbortSignal): Promise<Country[]> {
  return withFallback(async () => {
    const { data } = await httpClient.get<ApiEnvelope<Country[]>>("/countries", { signal });
    return unwrapList(data);
  }, getMockCountries);
}

export async function getDepartments(
  countryId: number,
  signal?: AbortSignal
): Promise<Department[]> {
  return withFallback(
    async () => {
      const { data } = await httpClient.get<ApiEnvelope<Department[]>>(
        `/departments/${countryId}`,
        { signal }
      );
      return unwrapList(data);
    },
    () => getMockDepartments(countryId)
  );
}

export async function getCities(departmentId: number, signal?: AbortSignal): Promise<City[]> {
  return withFallback(
    async () => {
      const { data } = await httpClient.get<ApiEnvelope<City[]>>(`/cities/${departmentId}`, {
        signal,
      });
      return unwrapList(data);
    },
    () => getMockCities(departmentId)
  );
}
