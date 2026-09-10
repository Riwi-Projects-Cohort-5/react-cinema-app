import axios from "axios";

import { ApiError } from "@services/api-error";
import { httpClient } from "@services/httpClient";
import type { Movie } from "@features/movies/interfaces/movie";

import { MOCK_MOVIES } from "./movies.mock";

function isCancellation(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) {
    return true;
  }
  if (axios.isCancel(error)) {
    return true;
  }
  if (error instanceof ApiError && error.isCanceled) {
    return true;
  }
  if (error instanceof Error && (error.name === "AbortError" || error.name === "CanceledError")) {
    return true;
  }
  return false;
}

/**
 * Obtiene la lista de películas desde la API.
 *
 * NOTA PARA DESARROLLADORES:
 * En entorno de desarrollo (import.meta.env.DEV), si la API no está disponible o falla,
 * se retorna una lista de películas mock (MOCK_MOVIES) para permitir la visualización y
 * trabajo en la interfaz local (Hero Carousel, etc.).
 * La API real sigue siendo la única fuente de verdad; en producción los errores se propagan.
 * Las solicitudes canceladas (AbortSignal) siempre relanzan el error.
 */
export async function getMovies(signal?: AbortSignal): Promise<Movie[]> {
  try {
    const { data } = await httpClient.get<Movie[]>("/movies", { signal });
    return data;
  } catch (error) {
    if (isCancellation(error, signal)) {
      throw error;
    }

    if (import.meta.env.DEV) {
      console.warn(
        "[movies.service] La API de películas no está disponible. Usando datos mock de desarrollo.",
        error
      );
      return MOCK_MOVIES;
    }

    throw error;
  }
}
