import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import type { ReactNode } from "react";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { Movie } from "@features/movies/interfaces/movie";
import { getMovies } from "@features/movies/services/movies.service";

import { useMovies } from "./useMovies";

vi.mock("@features/movies/services/movies.service", () => ({
  getMovies: vi.fn(),
}));

const mockGetMovies = vi.mocked(getMovies);

const mockMovies: Movie[] = [
  {
    id: 1,
    title: "Spider-Man: No Way Home",
    synopsis:
      "Peter Parker enfrenta las consecuencias de su identidad revelada y solicita ayuda al Doctor Strange.",
    genre: "Accion",
    rating: "PG-13",
    duration: 148,
    director: "Jon Watts",
    imageUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800",
    bannerUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
    trailerUrl: "https://www.youtube.com/watch?v=JfVOs4VSpmA",
    releaseDate: "2021-12-17",
    isActive: true,
  },
  {
    id: 2,
    title: "The Batman",
    synopsis: "Batman investiga la corrupción en Gotham City mientras persigue al Asertijo.",
    genre: "Accion",
    rating: "PG-13",
    duration: 176,
    director: "Matt Reeves",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
    trailerUrl: null,
    releaseDate: "2022-03-04",
    isActive: true,
  },
];

function renderUseMovies() {
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

  return renderHook(() => useMovies(), { wrapper });
}

describe("useMovies", () => {
  afterEach(() => {
    mockGetMovies.mockReset();
  });

  it("fetches and returns movie list on success", async () => {
    mockGetMovies.mockResolvedValue(mockMovies);

    const { result } = renderUseMovies();

    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(mockGetMovies).toHaveBeenCalledWith(expect.any(AbortSignal));
    expect(result.current.data).toEqual(mockMovies);
    expect(result.current.isError).toBe(false);
  });

  it("handles failure and returns error state", async () => {
    mockGetMovies.mockRejectedValue(new Error("Network error"));

    const { result } = renderUseMovies();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
