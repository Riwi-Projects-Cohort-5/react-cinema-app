export interface Movie {
  id: number;
  title: string;
  synopsis: string;
  genre: string;
  rating: string;
  duration: number;
  director?: string;
  imageUrl: string;
  bannerUrl: string;
  trailerUrl: string | null;
  releaseDate?: string;
  isActive: boolean;
}
