import { env } from "@config/env";
import { ApiError } from "@services/api-error";
import { httpClient } from "@services/httpClient";
import { notifyWarning } from "@services/notify";

import type { Movie, MovieFunction, MovieRecommendation } from "@features/movies/interfaces";
import {
  getMockMovieFunctions,
  getMockMovieRecommendations,
  getMockMovies,
} from "@features/movies/services/movies.mock";
import { useMoviesSourceStore } from "@features/movies/store/moviesSourceStore";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

const MALFORMED_RESPONSE = "MALFORMED_RESPONSE";

function unwrapList<T>(envelope: ApiEnvelope<T[]> | undefined): T[] {
  if (!envelope || envelope.success !== true || !Array.isArray(envelope.data)) {
    throw new ApiError("La respuesta de películas no tiene el formato esperado", {
      code: MALFORMED_RESPONSE,
    });
  }

  return envelope.data;
}

function isApiUnavailable(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.isCanceled) {
    return false;
  }

  return error.isNetwork || error.code === MALFORMED_RESPONSE || (error.status ?? 0) >= 500;
}

function reportFallback(): void {
  const { isUsingFallback, markFallback } = useMoviesSourceStore.getState();
  markFallback();

  if (isUsingFallback) return;

  notifyWarning(
    "Mostrando películas de ejemplo",
    "No pudimos conectar con el servidor. Verás una lista de referencia hasta que se restablezca."
  );
}

async function withFallback<T>(
  request: () => Promise<T[]>,
  fallback: () => Promise<T[]>
): Promise<T[]> {
  if (env.enableMocks) {
    useMoviesSourceStore.getState().markFallback();
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

export async function getMovies(signal?: AbortSignal): Promise<Movie[]> {
  return withFallback(async () => {
    const { data } = await httpClient.get<ApiEnvelope<Movie[]>>("/movies", { signal });
    return unwrapList(data);
  }, getMockMovies);
}

export async function getMovieFunctions(
  movieId: number,
  cityId?: number,
  signal?: AbortSignal
): Promise<MovieFunction[]> {
  return withFallback(
    async () => {
      const config = {
        signal,
        ...(cityId !== undefined ? { params: { cityId } } : {}),
      };
      const { data } = await httpClient.get<ApiEnvelope<MovieFunction[]>>(
        `/movies/${movieId}/functions`,
        config
      );
      return unwrapList(data);
    },
    () => getMockMovieFunctions(movieId)
  );
}

export async function getMovieRecommendations(
  movieId: number,
  signal?: AbortSignal
): Promise<MovieRecommendation[]> {
  return withFallback(
    async () => {
      const { data } = await httpClient.get<ApiEnvelope<MovieRecommendation[]>>(
        `/movies/${movieId}/recommendations`,
        { signal }
      );
      return unwrapList(data);
    },
    () => getMockMovieRecommendations(movieId)
  );
}

