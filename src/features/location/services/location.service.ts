import { env } from "@config/env";
import { httpClient } from "@services/httpClient";

import {
  getMockCities,
  getMockCountries,
  getMockDepartments,
} from "@features/location/services/location.mock";

import type { City, Country, Department } from "@shared/interfaces";

export async function getCountries(signal?: AbortSignal): Promise<Country[]> {
  if (env.enableMocks) {
    return getMockCountries();
  }

  const { data } = await httpClient.get<Country[]>("/countries", { signal });
  return data;
}

export async function getDepartments(
  countryId: number,
  signal?: AbortSignal,
): Promise<Department[]> {
  if (env.enableMocks) {
    return getMockDepartments(countryId);
  }

  const { data } = await httpClient.get<Department[]>(`/departments/${countryId}`, { signal });
  return data;
}

export async function getCities(departmentId: number, signal?: AbortSignal): Promise<City[]> {
  if (env.enableMocks) {
    return getMockCities(departmentId);
  }

  const { data } = await httpClient.get<City[]>(`/cities/${departmentId}`, { signal });
  return data;
}
