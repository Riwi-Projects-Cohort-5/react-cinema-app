// Entidades de ubicación (país → departamento → ciudad) — HU-FE-002.
// Usadas por la feature `location` y, vía su store, por Header, Cartelera y Registro paso 4.

export interface Country {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
  countryId: number;
}

export interface City {
  id: number;
  name: string;
  departmentId: number;
  isActive: boolean;
}

// Ubicación confirmada por el visitante. Guarda la cadena completa (no solo la ciudad) para poder
// reabrir el asistente con los tres selectores ya resueltos.
export interface SavedLocation {
  country: Pick<Country, "id" | "name">;
  department: Pick<Department, "id" | "name">;
  city: Pick<City, "id" | "name">;
}
