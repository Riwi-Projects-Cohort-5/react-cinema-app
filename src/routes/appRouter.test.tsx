import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Movie } from "@features/movies/interfaces/movie";
import { useMovies } from "@features/movies/hooks/useMovies";
import { renderRouter } from "@/test/helpers/renderRouter";
import { PATHS } from "@routes/paths";
import { useSessionStore } from "@services/session";

vi.mock("@features/movies/hooks/useMovies", () => ({
  useMovies: vi.fn(),
}));

const mockUseMovies = vi.mocked(useMovies);

const mockMovie: Movie = {
  id: 1,
  title: "Guardianes de la Galaxia",
  synopsis: "Un grupo de héroes intergalácticos debe unirse para salvar el universo.",
  genre: "Acción",
  classification: "PG-13",
  duration: 121,
  director: "James Gunn",
  language: "Español",
  isSubtitled: false,
  posterUrl: "https://image.tmdb.org/t/p/w500/poster1.jpg",
  trailerUrl: "https://www.youtube.com/watch?v=d96cjJhvlMA",
  releaseDate: "2014-08-01",
  rating: 8.0,
  isActive: true,
};

const mockMoviesFixture = {
  data: [mockMovie],
  isPending: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

describe("appRouter", () => {
  it("renders the home page at the root path", () => {
    mockUseMovies.mockReturnValue(mockMoviesFixture as unknown as ReturnType<typeof useMovies>);

    renderRouter(PATHS.home);

    expect(
      screen.getByRole("region", { name: /carrusel de películas destacadas/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
  });

  it("renders the login page when unauthenticated", () => {
    renderRouter(PATHS.auth.login);

    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("redirects unauthenticated users from a private route to login", () => {
    useSessionStore.setState({ accessToken: null });

    const router = renderRouter(PATHS.profile);

    expect(router.state.location.pathname).toBe(PATHS.auth.login);
    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("renders a private route when the user is authenticated", () => {
    useSessionStore.setState({ accessToken: "valid-token" });

    const router = renderRouter(PATHS.purchaseHistory);

    expect(router.state.location.pathname).toBe(PATHS.purchaseHistory);
    expect(screen.getByRole("heading", { name: "Purchase History" })).toBeInTheDocument();
  });

  it("renders the authenticated layout for private routes", () => {
    useSessionStore.setState({ accessToken: "valid-token" });

    renderRouter(PATHS.profile);

    expect(screen.getByRole("link", { name: "Perfil" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Historial de compras" })).toBeInTheDocument();
  });

  it("renders the admin layout when the user is authenticated", () => {
    useSessionStore.setState({ accessToken: "valid-token" });

    const router = renderRouter(PATHS.admin.dashboard);

    expect(router.state.location.pathname).toBe(PATHS.admin.dashboard);
    expect(screen.getByRole("link", { name: "Multicine Admin" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Admin Dashboard" })).toBeInTheDocument();
  });

  it("redirects authenticated users away from public-only routes", () => {
    mockUseMovies.mockReturnValue(mockMoviesFixture as unknown as ReturnType<typeof useMovies>);
    useSessionStore.setState({ accessToken: "valid-token" });

    const router = renderRouter(PATHS.auth.register);

    expect(router.state.location.pathname).toBe(PATHS.home);
    expect(
      screen.getByRole("region", { name: /carrusel de películas destacadas/i })
    ).toBeInTheDocument();
  });

  it("renders the 404 page for unknown paths", () => {
    renderRouter("/unknown-route");

    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
  });

  it("renders the general error page at the error path", () => {
    renderRouter(PATHS.error);

    expect(screen.getByRole("heading", { name: "Algo salió mal" })).toBeInTheDocument();
  });
});
