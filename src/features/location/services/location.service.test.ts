import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@services/api-error";
import { httpClient } from "@services/httpClient";
import { notifyWarning } from "@services/notify";

import { MOCK_COUNTRIES } from "@features/location/services/location.mock";
import { useLocationSourceStore } from "@features/location/store/locationSourceStore";

import { getCities, getCountries, getDepartments } from "./location.service";

vi.mock("@config/env", () => ({
  env: { apiBaseUrl: "/api/v1", apiTimeoutMs: 15000, enableMocks: false },
}));

vi.mock("@services/httpClient", () => ({
  httpClient: { get: vi.fn() },
}));

vi.mock("@services/notify", () => ({
  notifyWarning: vi.fn(),
}));

const get = vi.mocked(httpClient.get);
const notifyWarningMock = vi.mocked(notifyWarning);

beforeEach(() => {
  vi.clearAllMocks();
  useLocationSourceStore.setState({ isUsingFallback: false });
});

describe("location service", () => {
  it("unwraps the { success, data } envelope the API returns", async () => {
    const countries = [{ id: 1, name: "Colombia", isActive: true }];
    get.mockResolvedValue({ data: { success: true, data: countries } });

    await expect(getCountries()).resolves.toEqual(countries);
    expect(get).toHaveBeenCalledWith("/countries", { signal: undefined });
    expect(useLocationSourceStore.getState().isUsingFallback).toBe(false);
  });

  it("calls the dependent endpoints with the parent id in the path", async () => {
    get.mockResolvedValue({ data: { success: true, data: [] } });

    await getDepartments(7);
    expect(get).toHaveBeenCalledWith("/departments/7", { signal: undefined });

    await getCities(42);
    expect(get).toHaveBeenCalledWith("/cities/42", { signal: undefined });
  });

  it("falls back to local data when the network is down, and warns once", async () => {
    get.mockRejectedValue(new ApiError("sin conexión", { isNetwork: true }));

    await expect(getCountries()).resolves.toEqual(MOCK_COUNTRIES);
    expect(useLocationSourceStore.getState().isUsingFallback).toBe(true);
    expect(notifyWarningMock).toHaveBeenCalledTimes(1);

    await getCountries();
    expect(notifyWarningMock).toHaveBeenCalledTimes(1);
  });

  it("falls back when the API answers with a server error", async () => {
    get.mockRejectedValue(new ApiError("boom", { status: 503 }));

    await expect(getCountries()).resolves.toEqual(MOCK_COUNTRIES);
    expect(useLocationSourceStore.getState().isUsingFallback).toBe(true);
  });

  it("falls back when the payload does not match the expected envelope", async () => {
    get.mockResolvedValue({ data: [{ id: 1, name: "Colombia", isActive: true }] });

    await expect(getCountries()).resolves.toEqual(MOCK_COUNTRIES);
    expect(useLocationSourceStore.getState().isUsingFallback).toBe(true);
  });

  it("does not fall back on a client error: it stays a retryable failure", async () => {
    const notFound = new ApiError("no existe", { status: 404 });
    get.mockRejectedValue(notFound);

    await expect(getCountries()).rejects.toBe(notFound);
    expect(useLocationSourceStore.getState().isUsingFallback).toBe(false);
    expect(notifyWarningMock).not.toHaveBeenCalled();
  });

  it("does not fall back when the request was canceled", async () => {
    const canceled = new ApiError("cancelada", { isCanceled: true });
    get.mockRejectedValue(canceled);

    await expect(getCountries()).rejects.toBe(canceled);
    expect(useLocationSourceStore.getState().isUsingFallback).toBe(false);
  });
});

describe("location service with mocks forced", () => {
  it("skips the API entirely and flags the data as local", async () => {
    vi.resetModules();
    vi.doMock("@config/env", () => ({
      env: { apiBaseUrl: "/api/v1", apiTimeoutMs: 15000, enableMocks: true },
    }));

    const { getCountries: getCountriesForced } = await import("./location.service");
    const { useLocationSourceStore: forcedStore } =
      await import("@features/location/store/locationSourceStore");

    await expect(getCountriesForced()).resolves.toEqual(MOCK_COUNTRIES);
    expect(get).not.toHaveBeenCalled();
    expect(forcedStore.getState().isUsingFallback).toBe(true);

    vi.doUnmock("@config/env");
    vi.resetModules();
  });
});
