import type { City, Country, Department } from "@shared/interfaces";

// Datos simulados para desarrollo local (VITE_ENABLE_MOCKS=true) mientras la API real no esté
// disponible. Incluye ciudades inactivas y un departamento sin ciudades para poder ver los
// estados vacío / sin cines activos del asistente.

const MOCK_DELAY_MS = 400;

export const MOCK_COUNTRIES: Country[] = [
  { id: 1, name: "Colombia" },
  { id: 2, name: "México" },
  { id: 3, name: "Argentina" },
  { id: 4, name: "Perú" },
];

export const MOCK_DEPARTMENTS: Record<number, Department[]> = {
  1: [
    { id: 11, name: "Bogotá D.C.", countryId: 1 },
    { id: 12, name: "Antioquia", countryId: 1 },
    { id: 13, name: "Valle del Cauca", countryId: 1 },
    { id: 14, name: "Atlántico", countryId: 1 },
    { id: 15, name: "Santander", countryId: 1 },
  ],
  2: [
    { id: 21, name: "Ciudad de México", countryId: 2 },
    { id: 22, name: "Jalisco", countryId: 2 },
    { id: 23, name: "Nuevo León", countryId: 2 },
    { id: 24, name: "Puebla", countryId: 2 },
  ],
  3: [
    { id: 31, name: "Buenos Aires", countryId: 3 },
    { id: 32, name: "Córdoba", countryId: 3 },
    { id: 33, name: "Santa Fe", countryId: 3 },
  ],
  4: [
    { id: 41, name: "Lima", countryId: 4 },
    { id: 42, name: "Arequipa", countryId: 4 },
    { id: 43, name: "La Libertad", countryId: 4 },
  ],
};

export const MOCK_CITIES: Record<number, City[]> = {
  11: [{ id: 111, name: "Bogotá", departmentId: 11, isActive: true }],
  12: [
    { id: 121, name: "Medellín", departmentId: 12, isActive: true },
    { id: 122, name: "Envigado", departmentId: 12, isActive: true },
    { id: 123, name: "Bello", departmentId: 12, isActive: true },
    { id: 124, name: "Itagüí", departmentId: 12, isActive: false },
  ],
  13: [
    { id: 131, name: "Cali", departmentId: 13, isActive: true },
    { id: 132, name: "Palmira", departmentId: 13, isActive: false },
  ],
  14: [
    { id: 141, name: "Barranquilla", departmentId: 14, isActive: true },
    { id: 142, name: "Soledad", departmentId: 14, isActive: false },
  ],
  15: [
    { id: 151, name: "Bucaramanga", departmentId: 15, isActive: true },
    { id: 152, name: "Floridablanca", departmentId: 15, isActive: true },
  ],
  21: [{ id: 211, name: "Ciudad de México", departmentId: 21, isActive: true }],
  22: [
    { id: 221, name: "Guadalajara", departmentId: 22, isActive: true },
    { id: 222, name: "Zapopan", departmentId: 22, isActive: true },
  ],
  23: [
    { id: 231, name: "Monterrey", departmentId: 23, isActive: true },
    { id: 232, name: "San Pedro Garza García", departmentId: 23, isActive: false },
  ],
  24: [],
  31: [{ id: 311, name: "La Plata", departmentId: 31, isActive: true }],
  32: [{ id: 321, name: "Córdoba", departmentId: 32, isActive: true }],
  33: [{ id: 331, name: "Rosario", departmentId: 33, isActive: true }],
  41: [
    { id: 411, name: "Lima", departmentId: 41, isActive: true },
    { id: 412, name: "Miraflores", departmentId: 41, isActive: true },
  ],
  42: [{ id: 421, name: "Arequipa", departmentId: 42, isActive: true }],
  43: [{ id: 431, name: "Trujillo", departmentId: 43, isActive: true }],
};

function withDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_DELAY_MS);
  });
}

export function getMockCountries(): Promise<Country[]> {
  return withDelay(MOCK_COUNTRIES);
}

export function getMockDepartments(countryId: number): Promise<Department[]> {
  return withDelay(MOCK_DEPARTMENTS[countryId] ?? []);
}

export function getMockCities(departmentId: number): Promise<City[]> {
  return withDelay(MOCK_CITIES[departmentId] ?? []);
}
