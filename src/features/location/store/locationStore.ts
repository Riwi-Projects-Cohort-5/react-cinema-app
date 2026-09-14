import { create } from "zustand";

import { queryClient } from "@services/queryClient";

import {
  clearSavedLocation,
  readSavedLocation,
  writeSavedLocation,
} from "@features/location/services/location-storage";

import type { SavedLocation } from "@shared/interfaces";

interface LocationState {
  location: SavedLocation | null;
  isWizardOpen: boolean;
  setLocation: (location: SavedLocation) => void;
  clearLocation: () => void;
  openWizard: () => void;
  closeWizard: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: readSavedLocation(),
  isWizardOpen: false,
  setLocation: (location) => {
    writeSavedLocation(location);
    set({ location, isWizardOpen: false });
    // Cambiar de ciudad refresca la cartelera sin recargar la página (HU-FE-002, UBI-08).
    queryClient.invalidateQueries({ queryKey: ["movies"] });
    queryClient.invalidateQueries({ queryKey: ["cineflash"] });
  },
  clearLocation: () => {
    clearSavedLocation();
    set({ location: null });
  },
  openWizard: () => set({ isWizardOpen: true }),
  closeWizard: () => set({ isWizardOpen: false }),
}));

export function getSavedLocation(): SavedLocation | null {
  return useLocationStore.getState().location;
}
