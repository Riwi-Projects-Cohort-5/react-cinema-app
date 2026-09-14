import { useQuery } from "@tanstack/react-query";

import { getCountries } from "@features/location/services/location.service";

export function useCountries() {
  return useQuery({
    queryKey: ["countries"],
    queryFn: ({ signal }) => getCountries(signal),
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
