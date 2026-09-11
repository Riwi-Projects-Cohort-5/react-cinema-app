import { useQuery } from "@tanstack/react-query";

import { getCities } from "@features/location/services/location.service";

export function useCities(departmentId: number | null) {
  return useQuery({
    queryKey: ["cities", departmentId],
    queryFn: ({ signal }) => getCities(departmentId as number, signal),
    enabled: departmentId != null,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
