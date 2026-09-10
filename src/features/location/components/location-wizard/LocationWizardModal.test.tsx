import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { configure, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getCities, getCountries, getDepartments } from "@features/location/services/location.service";

import { LocationWizardModal } from "./LocationWizardModal";

vi.mock("@features/location/services/location.service", () => ({
  getCountries: vi.fn(),
  getDepartments: vi.fn(),
  getCities: vi.fn(),
}));

const getCountriesMock = vi.mocked(getCountries);
const getDepartmentsMock = vi.mocked(getDepartments);
const getCitiesMock = vi.mocked(getCities);

const COUNTRIES = [
  { id: 1, name: "Colombia" },
  { id: 2, name: "Perú" },
];

const DEPARTMENTS: Record<number, Awaited<ReturnType<typeof getDepartments>>> = {
  1: [
    { id: 11, name: "Antioquia", countryId: 1 },
    { id: 12, name: "Valle del Cauca", countryId: 1 },
    { id: 13, name: "Amazonas", countryId: 1 },
  ],
  2: [{ id: 21, name: "Lima", countryId: 2 }],
};

const CITIES: Record<number, Awaited<ReturnType<typeof getCities>>> = {
  11: [
    { id: 111, name: "Medellín", departmentId: 11, isActive: true },
    { id: 112, name: "Itagüí", departmentId: 11, isActive: false },
  ],
  12: [{ id: 121, name: "Cali", departmentId: 12, isActive: true }],
  13: [],
  21: [{ id: 211, name: "Lima", departmentId: 21, isActive: true }],
};

beforeEach(() => {
  vi.clearAllMocks();
  getCountriesMock.mockResolvedValue(COUNTRIES);
  getDepartmentsMock.mockImplementation(async (countryId: number) => DEPARTMENTS[countryId] ?? []);
  getCitiesMock.mockImplementation(async (departmentId: number) => CITIES[departmentId] ?? []);
});

function renderModal(props: Partial<Parameters<typeof LocationWizardModal>[0]> = {}) {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <LocationWizardModal isOpen onClose={onClose} onConfirm={onConfirm} {...props} />
    </QueryClientProvider>,
  );

  return { onConfirm, onClose };
}

// El suite completo corre en paralelo; 1 s (el default) se queda corto bajo carga.
configure({ asyncUtilTimeout: 5000 });

async function selectOption(comboboxName: string, optionName: string | RegExp) {
  const combobox = screen.getByRole("combobox", { name: comboboxName });
  await waitFor(() => expect(combobox).not.toBeDisabled());
  fireEvent.click(combobox);
  fireEvent.click(await screen.findByRole("option", { name: optionName }));
}

async function selectColombiaAntioquia() {
  await selectOption("País", "Colombia");
  await selectOption("Departamento / Estado", "Antioquia");
}

describe("LocationWizardModal", () => {
  it("keeps dependent selects disabled until their parent is chosen", async () => {
    renderModal();

    expect(screen.getByRole("combobox", { name: "Departamento / Estado" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Ciudad" })).toBeDisabled();

    await waitFor(() => expect(screen.getByRole("combobox", { name: "País" })).not.toBeDisabled());

    expect(screen.getByRole("combobox", { name: "Departamento / Estado" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Ciudad" })).toBeDisabled();
  });

  it("clears department and city when the country changes", async () => {
    renderModal();

    await selectColombiaAntioquia();
    await selectOption("Ciudad", "Medellín");

    await selectOption("País", "Perú");

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Departamento / Estado" })).toHaveTextContent(
        "Selecciona departamento",
      ),
    );
    expect(screen.getByRole("combobox", { name: "Ciudad" })).toHaveTextContent("Selecciona ciudad");
    expect(screen.getByRole("combobox", { name: "Ciudad" })).toBeDisabled();
  });

  it("clears the city when the department changes", async () => {
    renderModal();

    await selectColombiaAntioquia();
    await selectOption("Ciudad", "Medellín");

    await selectOption("Departamento / Estado", "Valle del Cauca");

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Ciudad" })).toHaveTextContent(
        "Selecciona ciudad",
      ),
    );
  });

  it("confirms with the full country/department/city chain", async () => {
    const { onConfirm } = renderModal();

    await selectColombiaAntioquia();
    await selectOption("Ciudad", "Medellín");

    const confirmButton = screen.getByRole("button", { name: /Confirmar ubicación/ });
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith({
      country: { id: 1, name: "Colombia" },
      department: { id: 11, name: "Antioquia" },
      city: { id: 111, name: "Medellín" },
    });
  });

  it("warns and blocks confirmation when the chosen city has no active cinemas", async () => {
    const { onConfirm } = renderModal();

    await selectColombiaAntioquia();
    await selectOption("Ciudad", /Itagüí/);

    expect(await screen.findByText(/Aún no hay cines activos en Itagüí/)).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: /Confirmar ubicación/ });
    expect(confirmButton).toBeDisabled();

    fireEvent.click(confirmButton);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("shows an empty state when the department has no cities", async () => {
    renderModal();

    await selectOption("País", "Colombia");
    await selectOption("Departamento / Estado", "Amazonas");

    expect(
      await screen.findByText("No hay ciudades disponibles para este departamento."),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Ciudad" })).toBeDisabled();
  });

  it("shows an error with a retry action and recovers after retrying", async () => {
    getCountriesMock.mockRejectedValueOnce(new Error("network down"));
    renderModal();

    expect(await screen.findByText("No pudimos cargar los países.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "País" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/ }));

    await waitFor(() => expect(screen.getByRole("combobox", { name: "País" })).not.toBeDisabled());
    expect(screen.queryByText("No pudimos cargar los países.")).not.toBeInTheDocument();
  });

  it("prefills the three selects from a previously saved location", async () => {
    renderModal({
      initialLocation: {
        country: { id: 1, name: "Colombia" },
        department: { id: 11, name: "Antioquia" },
        city: { id: 111, name: "Medellín" },
      },
    });

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Ciudad" })).toHaveTextContent("Medellín"),
    );
    expect(screen.getByRole("combobox", { name: "País" })).toHaveTextContent("Colombia");
    expect(screen.getByRole("combobox", { name: "Departamento / Estado" })).toHaveTextContent(
      "Antioquia",
    );
  });
});
