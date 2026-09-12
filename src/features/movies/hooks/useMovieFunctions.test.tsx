import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import type { ReactNode } from "react";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { MovieFunction } from "@features/movies/interfaces";
import { getMovieFunctions } from "@features/movies/services/movies.service";

import { useMovieFunctions } from "./useMovieFunctions";

vi.mock("@features/movies/services/movies.service", () => ({
  getMovieFunctions: vi.fn(),
}));

const mockGetMovieFunctions = vi.mocked(getMovieFunctions);

const mockFunctions: MovieFunction[] = [
  {
    id: 1,
    movieId: 1,
    cinemaId: 1,
    room: "Sala 1",
    format: "2D",
    startTime: "2026-09-10T14:30:00.000Z",
    price: 18000,
  },
  {
    id: 2,
    movieId: 1,
    cinemaId: 1,
    room: "Sala 2",
    format: "3D",
    startTime: "2026-09-10T17:00:00.000Z",
    price: 22000,
  },
];

function renderUseMovieFunctions(movieId: number, cityId?: number) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        retryDelay: 0,
        gcTime: 0,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(() => useMovieFunctions(movieId, cityId), { wrapper });
}

describe("useMovieFunctions", () => {
  afterEach(() => {
    mockGetMovieFunctions.mockReset();
  });

  it("fetches and returns movie functions on success without cityId", async () => {
    mockGetMovieFunctions.mockResolvedValue(mockFunctions);

    const { result } = renderUseMovieFunctions(1);

    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(mockGetMovieFunctions).toHaveBeenCalledWith(1, undefined, expect.any(AbortSignal));
    expect(result.current.data).toEqual(mockFunctions);
    expect(result.current.isError).toBe(false);
  });

  it("fetches and returns movie functions with cityId", async () => {
    mockGetMovieFunctions.mockResolvedValue(mockFunctions);

    const { result } = renderUseMovieFunctions(1, 42);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(mockGetMovieFunctions).toHaveBeenCalledWith(1, 42, expect.any(AbortSignal));
    expect(result.current.data).toEqual(mockFunctions);
  });

  it("handles failure and returns error state", async () => {
    mockGetMovieFunctions.mockRejectedValue(new Error("Network error"));

    const { result } = renderUseMovieFunctions(1);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
