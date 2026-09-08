import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";

import type { CineFlashResponse } from "@features/flashbar/interfaces/cineflash";

import { useCineFlash } from "./useCineFlash";

vi.mock("@features/flashbar/services/cineflash.service", () => ({
  getCineFlash: vi.fn(),
}));

import { getCineFlash } from "@features/flashbar/services/cineflash.service";

const mockGetCineFlash = vi.mocked(getCineFlash);

const mockCineFlash: CineFlashResponse = {
  active: true,
  discountPercent: 20,
  maxTicketsPerPurchase: 6,
  notAccumulableWith: ["membresias"],
  window: { startAt: "2026-09-07T00:00:00Z", endAt: "2026-09-08T00:00:00Z" },
  remainingSeconds: 3725,
  terms: "Hasta 20% de descuento",
  functions: [],
};

function renderUseCineFlash(cityId?: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return renderHook(() => useCineFlash(cityId), { wrapper });
}

describe("useCineFlash", () => {
  it("keeps the query disabled and idle without a cityId", async () => {
    const { result } = renderUseCineFlash(undefined);

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));

    expect(mockGetCineFlash).not.toHaveBeenCalled();
  });

  it("fetches cineflash data for the given cityId", async () => {
    mockGetCineFlash.mockResolvedValue(mockCineFlash);

    const { result } = renderUseCineFlash("bue");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockGetCineFlash).toHaveBeenCalledWith("bue", expect.any(AbortSignal));
    expect(result.current.data).toEqual(mockCineFlash);
  });

  it("surfaces service errors", async () => {
    mockGetCineFlash.mockRejectedValue(new Error("Fallo de red"));

    const { result } = renderUseCineFlash("bue");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });
});
