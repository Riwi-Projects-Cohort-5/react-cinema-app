import { useQuery } from "@tanstack/react-query";

import { getCineFlash } from "@features/flashbar/services/cineflash.service";

export function useCineFlash(cityId?: string) {
  return useQuery({
    queryKey: ["cineflash", cityId],
    queryFn: ({ signal }) => {
      if (!cityId) {
        throw new Error("cityId es obligatorio para consultar Cine Flash");
      }
      return getCineFlash(cityId, signal);
    },
    enabled: Boolean(cityId),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
