import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getCities,
  getCountries,
  getDepartments,
} from "@features/location/services/location.service";
import { readSavedLocation } from "@features/location/services/location-storage";
import { useLocationStore } from "@features/location/store";

import { LocationGate } from "./LocationGate";

vi.mock("@features/location/services/location.service", () => ({
  getCountries: vi.fn(async () => [{ id: 1, name: "Colombia" }]),
  getDepartments: vi.fn(async () => [{ id: 11, name: "Antioquia", countryId: 1 }]),
  getCities: vi.fn(async () => [{ id: 111, name: "Medellín", departmentId: 11, isActive: true }]),
}));

vi.mocked(getCountries);
vi.mocked(getDepartments);
vi.mocked(getCities);

// El suite completo corre en paralelo; 1 s (el default) se queda corto bajo carga.
configure({ asyncUtilTimeout: 5000 });

const SAVED_LOCATION = {
  country: { id: 1, name: "Colombia" },
  department: { id: 11, name: "Antioquia" },
  city: { id: 111, name: "Medellín" },
};

beforeEach(() => {
  window.localStorage.clear();
  useLocationStore.setState({ location: null, isWizardOpen: false });
});

function renderGate() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <LocationGate />
    </QueryClientProvider>,
  );
}

describe("LocationGate", () => {
  it("opens the wizard automatically when no location is saved", async () => {
    renderGate();

    expect(await screen.findByText("¿Desde dónde nos visitas?")).toBeInTheDocument();
  });

  it("does not open the wizard when a location was already saved", () => {
    useLocationStore.setState({ location: SAVED_LOCATION });

    renderGate();

    expect(screen.queryByText("¿Desde dónde nos visitas?")).not.toBeInTheDocument();
  });

  it("does not reopen itself after the visitor dismisses it", async () => {
    renderGate();

    await screen.findByText("¿Desde dónde nos visitas?");
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() =>
      expect(screen.queryByText("¿Desde dónde nos visitas?")).not.toBeInTheDocument(),
    );
  });

  it("saves the confirmed location to local storage", async () => {
    renderGate();

    await screen.findByText("¿Desde dónde nos visitas?");

    for (const [name, option] of [
      ["País", "Colombia"],
      ["Departamento / Estado", "Antioquia"],
      ["Ciudad", "Medellín"],
    ] as const) {
      const combobox = screen.getByRole("combobox", { name });
      await waitFor(() => expect(combobox).not.toBeDisabled());
      fireEvent.click(combobox);
      fireEvent.click(await screen.findByRole("option", { name: option }));
    }

    fireEvent.click(screen.getByRole("button", { name: /Confirmar ubicación/ }));

    await waitFor(() => expect(readSavedLocation()).toEqual(SAVED_LOCATION));
    expect(screen.queryByText("¿Desde dónde nos visitas?")).not.toBeInTheDocument();
  });
});
