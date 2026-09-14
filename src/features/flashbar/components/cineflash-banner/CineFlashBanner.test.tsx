import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
  maxTicketsPerPurchase: 3,
  notAccumulableWith: ["MEMBERSHIP", "GIFT_CARD"],
  window: {
    startAt: "2026-09-12T00:00:00Z",
    endAt: "2026-09-12T05:00:00Z",
  },
  remainingSeconds: 5 * 60 * 60,
  terms: "Hasta 20% de descuento en funciones seleccionadas",
  functions: [],
};

function renderBanner() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CineFlashBanner />
    </QueryClientProvider>
  );
}

describe("CineFlashBanner", () => {
  afterEach(() => {
    vi.useRealTimers();
    mockUseCineFlash.mockReset();
  });

  it("renders the promo banner with the configured message and countdown", async () => {
    mockUseCineFlash.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: mockCineFlash,
    } as ReturnType<typeof useCineFlash>);

    renderBanner();

    expect(await screen.findByRole("status", { name: "Cine Flash" })).toBeInTheDocument();
    expect(
      screen.getByText("Hasta 20% de descuento en funciones seleccionadas")
    ).toBeInTheDocument();
    expect(screen.getByText("05:00:00")).toBeInTheDocument();
  });

  it("renders the action button and triggers the action callback", async () => {
    const user = userEvent.setup();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    mockUseCineFlash.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: mockCineFlash,
    } as ReturnType<typeof useCineFlash>);

    renderBanner();

    await user.click(await screen.findByRole("button", { name: "Ver funciones" }));

    expect(logSpy).toHaveBeenCalledWith("Ver funciones");
    logSpy.mockRestore();
  });

  it("hides the banner and invalidates the query when the countdown expires", () => {
    vi.useFakeTimers();

    mockUseCineFlash.mockReturnValue({
      isPending: false,
      isError: false,
      error: null,
      data: { ...mockCineFlash, remainingSeconds: 1 },
    } as ReturnType<typeof useCineFlash>);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    render(
      <QueryClientProvider client={queryClient}>
        <CineFlashBanner />
      </QueryClientProvider>
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole("status", { name: "Cine Flash" })).not.toBeInTheDocument();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cineflash"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["movies", "cineflash"] });
  });
});
