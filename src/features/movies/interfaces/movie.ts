export interface Movie {
  id: number;
  title: string;
  synopsis: string;
  genre: string;
  classification: string;
  duration: number;
  director: string;
  language: string;
  isSubtitled: boolean;
  posterUrl: string;
  trailerUrl: string | null;
  releaseDate: string;
  rating: number;
  isActive: boolean;
}
