import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getCities,
  getCountries,
  getDepartments,
} from "@features/location/services/location.service";
import { readSavedLocation } from "@features/location/services/location-storage";
import { useLocationStore } from "@features/location/store";
import { PATHS } from "@routes/paths";

import { LocationGate } from "./LocationGate";

vi.mock("@features/location/services/location.service", () => ({
  getCountries: vi.fn(async () => [{ id: 1, name: "Colombia", isActive: true }]),
  getDepartments: vi.fn(async () => [{ id: 11, name: "Antioquia", countryId: 1, isActive: true }]),
  getCities: vi.fn(async () => [{ id: 111, name: "Medellín", departmentId: 11, isActive: true }]),
}));

vi.mocked(getCountries);
vi.mocked(getDepartments);
vi.mocked(getCities);

// El suite completo corre en paralelo; 1 s (el default) se queda corto bajo carga.
configure({ asyncUtilTimeout: 5000 });

const WIZARD_TITLE = "¿Desde dónde nos visitas?";

const SAVED_LOCATION = {
  country: { id: 1, name: "Colombia" },
  department: { id: 11, name: "Antioquia" },
  city: { id: 111, name: "Medellín" },
};

beforeEach(() => {
  window.localStorage.clear();
  useLocationStore.setState({ location: null, isWizardOpen: false });
});

// Como en App.tsx, el gate se renderiza fuera del RouterProvider y solo recibe el router.
function renderGate(initialPath: string = PATHS.home) {
  const router = createMemoryRouter([{ path: "*", element: null }], {
    initialEntries: [initialPath],
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <LocationGate router={router} />
    </QueryClientProvider>
  );
  return router;
}

describe("LocationGate", () => {
  it("opens the wizard automatically when no location is saved", async () => {
    renderGate();

    expect(await screen.findByText(WIZARD_TITLE)).toBeInTheDocument();
  });

  it("does not open the wizard when a location was already saved", () => {
    useLocationStore.setState({ location: SAVED_LOCATION });

    renderGate();

    expect(screen.queryByText(WIZARD_TITLE)).not.toBeInTheDocument();
  });

  it.each([PATHS.auth.login, PATHS.auth.register])(
    "does not open the wizard automatically on %s",
    (path) => {
      renderGate(path);

      expect(useLocationStore.getState().isWizardOpen).toBe(false);
      expect(screen.queryByText(WIZARD_TITLE)).not.toBeInTheDocument();
    }
  );

  it("opens the wizard once the visitor leaves an auth route", async () => {
    const router = renderGate(PATHS.auth.register);
    expect(screen.queryByText(WIZARD_TITLE)).not.toBeInTheDocument();

    await act(() => router.navigate(PATHS.home));

    expect(await screen.findByText(WIZARD_TITLE)).toBeInTheDocument();
  });

  it("still lets the visitor open the wizard manually on an auth route", async () => {
    renderGate(PATHS.auth.login);

    act(() => useLocationStore.getState().openWizard());

    expect(await screen.findByText(WIZARD_TITLE)).toBeInTheDocument();
  });

  it("does not reopen itself after the visitor dismisses it", async () => {
    const router = renderGate();

    await screen.findByText(WIZARD_TITLE);
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(screen.queryByText(WIZARD_TITLE)).not.toBeInTheDocument());

    // Tampoco al navegar: la primera visita ya se evaluó.
    await act(() => router.navigate(PATHS.auth.login));
    await act(() => router.navigate(PATHS.profile));

    expect(useLocationStore.getState().isWizardOpen).toBe(false);
    expect(screen.queryByText(WIZARD_TITLE)).not.toBeInTheDocument();
  });

  it("saves the confirmed location to local storage", async () => {
    renderGate();

    await screen.findByText(WIZARD_TITLE);

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
    expect(screen.queryByText(WIZARD_TITLE)).not.toBeInTheDocument();
  });
});
