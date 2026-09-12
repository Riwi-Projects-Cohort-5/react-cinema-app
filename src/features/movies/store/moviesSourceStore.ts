import { create } from "zustand";

// Marca si los datos de películas provienen de la API o de los datos de respaldo locales.
interface MoviesSourceState {
  isUsingFallback: boolean;
  markFallback: () => void;
  reset: () => void;
}

export const useMoviesSourceStore = create<MoviesSourceState>((set) => ({
  isUsingFallback: false,
  markFallback: () => set({ isUsingFallback: true }),
  reset: () => set({ isUsingFallback: false }),
}));
