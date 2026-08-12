import { useQuery } from "@tanstack/react-query";

import { getHealth } from "@features/health/services/health.service";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => getHealth(signal),
    staleTime: 30_000,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 60_000),
  });
}
