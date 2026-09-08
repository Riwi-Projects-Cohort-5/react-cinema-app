import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { CineFlashResponse } from "@features/flashbar/interfaces/cineflash";
import { useCineFlash } from "@features/flashbar/hooks/useCineFlash";

import { CineFlashBanner } from "./CineFlashBanner";

vi.mock("@features/flashbar/hooks/useCineFlash", () => ({
  useCineFlash: vi.fn(),
}));

const mockUseCineFlash = vi.mocked(useCineFlash);

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

function renderBanner(): QueryClient {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <CineFlashBanner />
    </QueryClientProvider>
  );
  return queryClient;
}

describe("CineFlashBanner", () => {
  afterEach(() => {
    vi.useRealTimers();
    mockUseCineFlash.mockReset();
  });

  it("renders nothing while pending", () => {
    mockUseCineFlash.mockReturnValue({
      isPending: true,
      isError: false,
      error: null,
      data: undefined,
    } as ReturnType<typeof useCineFlash>);

    renderBanner();

    expect(screen.queryByRole("status", { name: "Cine Flash" })).not.toBeInTheDocument();
  });

  it("renders nothing on error", () => {
    mockUseCineFlash.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error("Fallo de red"),
      data: undefined,
    } as ReturnType<typeof useCineFlash>);

    renderBanner();

    expect(screen.queryByRole("status", { name: "Cine Flash" })).not.toBeInTheDocument();
  });

  it("renders nothing when the promotion is not active", () => {
    mockUseCineFlash.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: { ...mockCineFlash, active: false },
    } as ReturnType<typeof useCineFlash>);

    renderBanner();

    expect(screen.queryByRole("status", { name: "Cine Flash" })).not.toBeInTheDocument();
  });

  it("renders the Flashbar with terms and a live countdown when active", () => {
    mockUseCineFlash.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: mockCineFlash,
    } as ReturnType<typeof useCineFlash>);

    renderBanner();

    expect(screen.getByRole("status", { name: "Cine Flash" })).toBeInTheDocument();
    expect(screen.getByText("Hasta 20% de descuento")).toBeInTheDocument();
    expect(screen.getByText("01:02:05")).toBeInTheDocument();
  });

  it("invalidates cineflash queries when the countdown expires", () => {
    vi.useFakeTimers();

    mockUseCineFlash.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: { ...mockCineFlash, remainingSeconds: 1 },
    } as ReturnType<typeof useCineFlash>);

    const queryClient = renderBanner();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cineflash"] });
  });
});
