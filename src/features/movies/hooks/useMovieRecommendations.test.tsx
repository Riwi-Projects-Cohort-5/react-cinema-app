import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import type { ReactNode } from "react";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { MovieRecommendation } from "@features/movies/interfaces";
import { getMovieRecommendations } from "@features/movies/services/movies.service";

import { useMovieRecommendations } from "./useMovieRecommendations";

vi.mock("@features/movies/services/movies.service", () => ({
  getMovieRecommendations: vi.fn(),
}));

const mockGetMovieRecommendations = vi.mocked(getMovieRecommendations);

const mockRecommendations: MovieRecommendation[] = [
  {
    id: 2,
    title: "Spider-Man: Beyond the Spider-Verse",
    genre: "Animación / Acción",
    imageUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800",
  },
];

function renderUseMovieRecommendations(movieId: number) {
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

  return renderHook(() => useMovieRecommendations(movieId), { wrapper });
}

describe("useMovieRecommendations", () => {
  afterEach(() => {
    mockGetMovieRecommendations.mockReset();
  });

  it("fetches and returns movie recommendations on success", async () => {
    mockGetMovieRecommendations.mockResolvedValue(mockRecommendations);

    const { result } = renderUseMovieRecommendations(1);

    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(mockGetMovieRecommendations).toHaveBeenCalledWith(1, expect.any(AbortSignal));
    expect(result.current.data).toEqual(mockRecommendations);
    expect(result.current.isError).toBe(false);
  });

  it("handles failure and returns error state", async () => {
    mockGetMovieRecommendations.mockRejectedValue(new Error("Network error"));

    const { result } = renderUseMovieRecommendations(1);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
