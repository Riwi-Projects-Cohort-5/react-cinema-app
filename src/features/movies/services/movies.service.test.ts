import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@services/api-error";
import { httpClient } from "@services/httpClient";
import { MOCK_MOVIES } from "./movies.mock";
import { getMovies } from "./movies.service";

vi.mock("@services/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

const mockHttpClientGet = vi.mocked(httpClient.get);

describe("getMovies service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns real API data on successful request", async () => {
    const apiMovies = [
      {
        id: 99,
        title: "Película API",
        synopsis: "Sinopsis API",
        genre: "Drama",
        classification: "+13",
        duration: 120,
        director: "Director",
        language: "Español",
        isSubtitled: false,
        posterUrl: "https://image.tmdb.org/t/p/w500/sample.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=sample",
        releaseDate: "2024-01-01",
        rating: 8.0,
        isActive: true,
      },
    ];

    mockHttpClientGet.mockResolvedValueOnce({ data: apiMovies });

    const result = await getMovies();

    expect(mockHttpClientGet).toHaveBeenCalledWith("/movies", { signal: undefined });
    expect(result).toEqual(apiMovies);
  });

  it("passes AbortSignal to httpClient.get", async () => {
    const controller = new AbortController();
    mockHttpClientGet.mockResolvedValueOnce({ data: [] });

    await getMovies(controller.signal);

    expect(mockHttpClientGet).toHaveBeenCalledWith("/movies", { signal: controller.signal });
  });

  it("returns fallback mock movies when API fails in DEV environment", async () => {
    mockHttpClientGet.mockRejectedValueOnce(new Error("Network Error"));

    const result = await getMovies();

    expect(result).toEqual(MOCK_MOVIES);
  });

  it("rethrows error on cancellation/abort even in DEV environment", async () => {
    const cancelError = new ApiError("La petición fue cancelada", { isCanceled: true });
    mockHttpClientGet.mockRejectedValueOnce(cancelError);

    await expect(getMovies()).rejects.toThrow(cancelError);
  });

  it("rethrows error when AbortSignal is aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    mockHttpClientGet.mockRejectedValueOnce(new Error("Canceled"));

    await expect(getMovies(controller.signal)).rejects.toThrow("Canceled");
  });

  it("rethrows error when not in DEV environment", async () => {
    const networkError = new Error("Network Error");
    mockHttpClientGet.mockRejectedValueOnce(networkError);

    const envObj = import.meta.env as unknown as { DEV: boolean };
    const originalDev = envObj.DEV;
    envObj.DEV = false;

    try {
      await expect(getMovies()).rejects.toThrow(networkError);
    } finally {
      envObj.DEV = originalDev;
    }
  });
});
