import { create } from "zustand";

// Marca si las listas de ubicación provienen de la API o de los datos de respaldo locales.
// Existe para que el asistente pueda advertirlo en pantalla: un respaldo silencioso haría creer
// que la API está sana cuando no lo está.
interface LocationSourceState {
  isUsingFallback: boolean;
  markFallback: () => void;
  reset: () => void;
}

export const useLocationSourceStore = create<LocationSourceState>((set) => ({
  isUsingFallback: false,
  markFallback: () => set({ isUsingFallback: true }),
  reset: () => set({ isUsingFallback: false }),
}));
