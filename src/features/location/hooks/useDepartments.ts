import { useQuery } from "@tanstack/react-query";

import { getDepartments } from "@features/location/services/location.service";

export function useDepartments(countryId: number | null) {
  return useQuery({
    queryKey: ["departments", countryId],
    queryFn: ({ signal }) => getDepartments(countryId as number, signal),
    enabled: countryId != null,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
