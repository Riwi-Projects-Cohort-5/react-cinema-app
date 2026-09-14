import { beforeEach, describe, expect, it } from "vitest";

import { clearSavedLocation, readSavedLocation, writeSavedLocation } from "./location-storage";

import type { SavedLocation } from "@shared/interfaces";

const STORAGE_KEY = "multicine_city";

const LOCATION: SavedLocation = {
  country: { id: 1, name: "Colombia" },
  department: { id: 11, name: "Antioquia" },
  city: { id: 111, name: "Medellín" },
};

beforeEach(() => {
  window.localStorage.clear();
});

describe("location storage", () => {
  it("returns null when nothing was saved", () => {
    expect(readSavedLocation()).toBeNull();
  });

  it("persists and recovers the saved location", () => {
    writeSavedLocation(LOCATION);

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(LOCATION));
    expect(readSavedLocation()).toEqual(LOCATION);
  });

  it("ignores malformed JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ not json");

    expect(readSavedLocation()).toBeNull();
  });

  it("ignores stored values that do not match the expected shape", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ city: { id: "111" } }));

    expect(readSavedLocation()).toBeNull();
  });

  it("clears the saved location", () => {
    writeSavedLocation(LOCATION);
    clearSavedLocation();

    expect(readSavedLocation()).toBeNull();
  });
});
