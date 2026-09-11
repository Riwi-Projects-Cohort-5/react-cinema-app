import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { queryClient } from "@services/queryClient";

import { readSavedLocation } from "@features/location/services/location-storage";

import { useLocationStore } from "./locationStore";

import type { SavedLocation } from "@shared/interfaces";

const LOCATION: SavedLocation = {
  country: { id: 1, name: "Colombia" },
  department: { id: 11, name: "Antioquia" },
  city: { id: 111, name: "Medellín" },
};

beforeEach(() => {
  window.localStorage.clear();
  useLocationStore.setState({ location: null, isWizardOpen: false });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("location store", () => {
  it("persists the location and closes the wizard when confirming", () => {
    useLocationStore.setState({ isWizardOpen: true });

    useLocationStore.getState().setLocation(LOCATION);

    expect(useLocationStore.getState().location).toEqual(LOCATION);
    expect(useLocationStore.getState().isWizardOpen).toBe(false);
    expect(readSavedLocation()).toEqual(LOCATION);
  });

  it("invalidates the listing queries so they refresh without a page reload", () => {
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);

    useLocationStore.getState().setLocation(LOCATION);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["movies"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["cineflash"] });
  });

  it("clears the stored location", () => {
    useLocationStore.getState().setLocation(LOCATION);

    useLocationStore.getState().clearLocation();

    expect(useLocationStore.getState().location).toBeNull();
    expect(readSavedLocation()).toBeNull();
  });

  it("opens and closes the wizard", () => {
    useLocationStore.getState().openWizard();
    expect(useLocationStore.getState().isWizardOpen).toBe(true);

    useLocationStore.getState().closeWizard();
    expect(useLocationStore.getState().isWizardOpen).toBe(false);
  });
});
