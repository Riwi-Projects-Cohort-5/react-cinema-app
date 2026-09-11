import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@services/api-error";
import { httpClient } from "@services/httpClient";
import { notifyWarning } from "@services/notify";

import {
  MOCK_MOVIES,
  getMockMovieFunctions,
  getMockMovieRecommendations,
} from "@features/movies/services/movies.mock";
import { useMoviesSourceStore } from "@features/movies/store/moviesSourceStore";

import { getMovieFunctions, getMovieRecommendations, getMovies } from "./movies.service";

vi.mock("@config/env", () => ({
  env: { apiBaseUrl: "/api/v1", apiTimeoutMs: 15000, enableMocks: false },
}));

vi.mock("@services/httpClient", () => ({
  httpClient: { get: vi.fn() },
}));

vi.mock("@services/notify", () => ({
  notifyWarning: vi.fn(),
}));

const get = vi.mocked(httpClient.get);
const notifyWarningMock = vi.mocked(notifyWarning);

beforeEach(() => {
  vi.clearAllMocks();
  useMoviesSourceStore.setState({ isUsingFallback: false });
});

describe("movies service", () => {
  it("unwraps the { success, data } envelope the API returns for getMovies", async () => {
    const movies = [
      {
        id: 1,
        title: "Test Movie",
        synopsis: "Test Synopsis",
        genre: "Action",
        classification: "+13",
        duration: 120,
        director: "Test Director",
        language: "Spanish",
        isSubtitled: false,
        posterUrl: "https://example.com/poster.jpg",
        trailerUrl: null,
        releaseDate: "2024-01-01",
        rating: 8.0,
        isActive: true,
      },
    ];
    get.mockResolvedValue({ data: { success: true, data: movies } });

    await expect(getMovies()).resolves.toEqual(movies);
    expect(get).toHaveBeenCalledWith("/movies", { signal: undefined });
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(false);
  });

  it("unwraps the envelope for getMovieFunctions without cityId", async () => {
    const functions = [
      {
        id: 1,
        movieId: 1,
        cinemaId: 1,
        room: "Sala 1",
        format: "2D",
        startTime: "2026-09-10T14:30:00.000Z",
        price: 18000,
      },
    ];
    get.mockResolvedValue({ data: { success: true, data: functions } });

    await expect(getMovieFunctions(1)).resolves.toEqual(functions);
    expect(get).toHaveBeenCalledWith("/movies/1/functions", { signal: undefined });
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(false);
  });

  it("unwraps the envelope for getMovieFunctions with cityId in params", async () => {
    const functions = [
      {
        id: 1,
        movieId: 1,
        cinemaId: 2,
        room: "Sala 2",
        format: "3D",
        startTime: "2026-09-10T17:00:00.000Z",
        price: 22000,
      },
    ];
    get.mockResolvedValue({ data: { success: true, data: functions } });

    await expect(getMovieFunctions(1, 2)).resolves.toEqual(functions);
    expect(get).toHaveBeenCalledWith("/movies/1/functions", {
      signal: undefined,
      params: { cityId: 2 },
    });
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(false);
  });

  it("unwraps the envelope for getMovieRecommendations", async () => {
    const recommendations = [
      {
        id: 2,
        title: "Spider-Man: Beyond the Spider-Verse",
        genre: "Animación / Acción",
        imageUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800",
      },
    ];
    get.mockResolvedValue({ data: { success: true, data: recommendations } });

    await expect(getMovieRecommendations(1)).resolves.toEqual(recommendations);
    expect(get).toHaveBeenCalledWith("/movies/1/recommendations", { signal: undefined });
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(false);
  });

  it("falls back to local data when the network is down, and warns once", async () => {
    get.mockRejectedValue(new ApiError("sin conexión", { isNetwork: true }));

    await expect(getMovies()).resolves.toEqual(MOCK_MOVIES);
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(true);
    expect(notifyWarningMock).toHaveBeenCalledTimes(1);

    await getMovies();
    expect(notifyWarningMock).toHaveBeenCalledTimes(1);
  });

  it("falls back when the API answers with a server error", async () => {
    get.mockRejectedValue(new ApiError("boom", { status: 503 }));

    await expect(getMovies()).resolves.toEqual(MOCK_MOVIES);
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(true);
  });

  it("falls back for movie functions on server error", async () => {
    get.mockRejectedValue(new ApiError("server error", { status: 500 }));

    const expected = await getMockMovieFunctions(1);
    await expect(getMovieFunctions(1)).resolves.toEqual(expected);
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(true);
  });

  it("falls back for movie recommendations on server error", async () => {
    get.mockRejectedValue(new ApiError("server error", { status: 500 }));

    const expected = await getMockMovieRecommendations(1);
    await expect(getMovieRecommendations(1)).resolves.toEqual(expected);
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(true);
  });

  it("falls back when the payload does not match the expected envelope", async () => {
    get.mockResolvedValue({ data: [{ id: 1, title: "Dune" }] });

    await expect(getMovies()).resolves.toEqual(MOCK_MOVIES);
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(true);
  });

  it("does not fall back on a client error: it stays a retryable failure", async () => {
    const notFound = new ApiError("no existe", { status: 404 });
    get.mockRejectedValue(notFound);

    await expect(getMovies()).rejects.toBe(notFound);
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(false);
    expect(notifyWarningMock).not.toHaveBeenCalled();
  });

  it("does not fall back when the request was canceled", async () => {
    const canceled = new ApiError("cancelada", { isCanceled: true });
    get.mockRejectedValue(canceled);

    await expect(getMovies()).rejects.toBe(canceled);
    expect(useMoviesSourceStore.getState().isUsingFallback).toBe(false);
  });
});

describe("movies service with mocks forced", () => {
  it("skips the API entirely and flags the data as local", async () => {
    vi.resetModules();
    vi.doMock("@config/env", () => ({
      env: { apiBaseUrl: "/api/v1", apiTimeoutMs: 15000, enableMocks: true },
    }));

    const {
      getMovies: getMoviesForced,
      getMovieFunctions: getMovieFunctionsForced,
      getMovieRecommendations: getMovieRecommendationsForced,
    } = await import("./movies.service");
    const { useMoviesSourceStore: forcedStore } =
      await import("@features/movies/store/moviesSourceStore");

    await expect(getMoviesForced()).resolves.toEqual(MOCK_MOVIES);
    const expectedFunctions = await getMockMovieFunctions(1);
    await expect(getMovieFunctionsForced(1)).resolves.toEqual(expectedFunctions);
    const expectedRecs = await getMockMovieRecommendations(1);
    await expect(getMovieRecommendationsForced(1)).resolves.toEqual(expectedRecs);

    expect(get).not.toHaveBeenCalled();
    expect(forcedStore.getState().isUsingFallback).toBe(true);

    vi.doUnmock("@config/env");
    vi.resetModules();
  });
});

