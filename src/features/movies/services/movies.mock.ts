import type { Movie, MovieFunction, MovieRecommendation } from "@features/movies/interfaces";

const MOCK_DELAY_MS = 400;

function withDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

/**
 * Mock movies fixture for local development and preview purposes.
 * Used only as a fallback when the backend API is unavailable during `npm run dev`.
 */
export const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Dune: Parte Dos",
    synopsis:
      "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia, enfrentando una elección entre el amor de su vida y el destino del universo.",
    genre: "Ciencia Ficción",
    rating: "+13",
    duration: 166,
    director: "Denis Villeneuve",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    releaseDate: "2024-03-01",
    isActive: true,
  },
  {
    id: 2,
    title: "Spider-Man: A Través del Spider-Verso",
    synopsis:
      "Miles Morales es catapultado a través del Multiverso, donde se encuentra con un equipo de Spider-People encargados de proteger su propia existencia frente a una nueva y peligrosa amenaza.",
    genre: "Animación / Acción",
    rating: "ATP",
    duration: 140,
    director: "Joaquim Dos Santos, Kemp Powers",
    imageUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800",
    bannerUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
    trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
    releaseDate: "2023-06-02",
    isActive: true,
  },
  {
    id: 3,
    title: "Oppenheimer",
    synopsis:
      "La historia del físico teórico estadounidense J. Robert Oppenheimer y su rol decisivo en el desarrollo de las primeras armas nucleares en el Proyecto Manhattan.",
    genre: "Drama / Historia",
    rating: "+16",
    duration: 180,
    director: "Christopher Nolan",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800",
    bannerUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    releaseDate: "2023-07-21",
    isActive: true,
  },
  {
    id: 4,
    title: "Interestelar",
    synopsis:
      "Un grupo de científicos y exploradores emprende un viaje a través de un agujero de gusano espacial para encontrar un nuevo hogar que asegure la supervivencia de la humanidad.",
    genre: "Ciencia Ficción / Aventura",
    rating: "+13",
    duration: 169,
    director: "Christopher Nolan",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    bannerUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    releaseDate: "2014-11-07",
    isActive: true,
  },
];

export function getMockMovies(): Promise<Movie[]> {
  return withDelay(MOCK_MOVIES);
}

export function getMockMovieFunctions(movieId: number): Promise<MovieFunction[]> {
  const mockFunctions: MovieFunction[] = [
    {
      id: 1,
      movieId,
      cinemaId: 1,
      room: "Sala 1",
      format: "2D",
      startTime: "2026-09-10T14:30:00.000Z",
      price: 18000,
    },
    {
      id: 2,
      movieId,
      cinemaId: 1,
      room: "Sala 2",
      format: "3D",
      startTime: "2026-09-10T17:00:00.000Z",
      price: 22000,
    },
    {
      id: 3,
      movieId,
      cinemaId: 1,
      room: "Sala IMAX",
      format: "IMAX",
      startTime: "2026-09-10T19:45:00.000Z",
      price: 28000,
    },
    {
      id: 4,
      movieId,
      cinemaId: 1,
      room: "Sala VIP",
      format: "VIP",
      startTime: "2026-09-10T22:15:00.000Z",
      price: 35000,
    },
  ];

  return withDelay(mockFunctions);
}

export function getMockMovieRecommendations(movieId: number): Promise<MovieRecommendation[]> {
  const recommendations: MovieRecommendation[] = MOCK_MOVIES.filter(
    (movie) => movie.id !== movieId
  ).map((movie) => ({
    id: movie.id,
    title: movie.title,
    genre: movie.genre,
    imageUrl: movie.imageUrl,
  }));

  return withDelay(recommendations);
}

