import type { CineFlashResponse } from "@features/flashbar/interfaces/cineflash";

export async function getMockCineFlash(cityId?: string): Promise<CineFlashResponse> {
  // Mock temporal usado mientras la API real de Cine Flash no esté disponible.
  // Se usa solo cuando VITE_ENABLE_MOCKS=true o cuando la petición real falla.
  void cityId;

  return {
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
}
