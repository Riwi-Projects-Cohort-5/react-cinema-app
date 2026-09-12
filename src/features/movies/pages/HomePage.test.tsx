import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Movie } from "@features/movies/interfaces/movie";
import { useMovies } from "@features/movies/hooks/useMovies";

import { HomePage } from "./HomePage";

vi.mock("@features/movies/hooks/useMovies", () => ({
  useMovies: vi.fn(),
}));

const mockUseMovies = vi.mocked(useMovies);

const mockMovie: Movie = {
  id: 1,
  title: "Guardianes de la Galaxia",
  synopsis: "Un grupo de héroes intergalácticos debe unirse para salvar el universo.",
  genre: "Acción",
  rating: "PG-13",
  duration: 121,
  director: "James Gunn",
  imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
  bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
  trailerUrl: "https://www.youtube.com/watch?v=d96cjJhvlMA",
  releaseDate: "2014-08-01",
  isActive: true,
};

describe("HomePage", () => {
  it("renders the hero carousel region on home page", () => {
    mockUseMovies.mockReturnValue({
      data: [mockMovie],
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMovies>);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("region", { name: /carrusel de películas destacadas/i })
    ).toBeInTheDocument();
  });
});
