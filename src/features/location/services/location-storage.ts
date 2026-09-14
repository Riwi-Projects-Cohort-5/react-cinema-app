import { z } from "zod";

import type { SavedLocation } from "@shared/interfaces";

// Clave definida en docs/api/endpoints/01-location/05-POST-users-location.md
const STORAGE_KEY = "multicine_city";

const namedEntitySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});

const savedLocationSchema = z.object({
  country: namedEntitySchema,
  department: namedEntitySchema,
  city: namedEntitySchema,
});

export function readSavedLocation(): SavedLocation | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = savedLocationSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    // localStorage puede lanzar en modo privado o con cookies bloqueadas.
    return null;
  }
}

export function writeSavedLocation(location: SavedLocation): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch {
    // Sin persistencia la ubicación sigue vigente en el store durante la sesión.
  }
}

export function clearSavedLocation(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que limpiar si el almacenamiento no está disponible.
  }
}
