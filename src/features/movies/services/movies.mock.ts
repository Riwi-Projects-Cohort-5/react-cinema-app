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
    classification: "+13",
    duration: 166,
    director: "Denis Villeneuve",
    language: "Inglés",
    isSubtitled: true,
    posterUrl: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    releaseDate: "2024-03-01",
    rating: 8.5,
    isActive: true,
  },
  {
    id: 2,
    title: "Spider-Man: A Través del Spider-Verso",
    synopsis:
      "Miles Morales es catapultado a través del Multiverso, donde se encuentra con un equipo de Spider-People encargados de proteger su propia existencia frente a una nueva y peligrosa amenaza.",
    genre: "Animación / Acción",
    classification: "ATP",
    duration: 140,
    director: "Joaquim Dos Santos, Kemp Powers",
    language: "Español",
    isSubtitled: false,
    posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
    releaseDate: "2023-06-02",
    rating: 8.7,
    isActive: true,
  },
  {
    id: 3,
    title: "Oppenheimer",
    synopsis:
      "La historia del físico teórico estadounidense J. Robert Oppenheimer y su rol decisivo en el desarrollo de las primeras armas nucleares en el Proyecto Manhattan.",
    genre: "Drama / Historia",
    classification: "+16",
    duration: 180,
    director: "Christopher Nolan",
    language: "Inglés",
    isSubtitled: true,
    posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    releaseDate: "2023-07-21",
    rating: 8.9,
    isActive: true,
  },
  {
    id: 4,
    title: "Interestelar",
    synopsis:
      "Un grupo de científicos y exploradores emprende un viaje a través de un agujero de gusano espacial para encontrar un nuevo hogar que asegure la supervivencia de la humanidad.",
    genre: "Ciencia Ficción / Aventura",
    classification: "+13",
    duration: 169,
    director: "Christopher Nolan",
    language: "Inglés",
    isSubtitled: true,
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    releaseDate: "2014-11-07",
    rating: 8.7,
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
    imageUrl: movie.posterUrl,
  }));

  return withDelay(recommendations);
}

