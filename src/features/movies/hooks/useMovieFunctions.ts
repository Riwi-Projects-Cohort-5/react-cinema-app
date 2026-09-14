import { useQuery } from "@tanstack/react-query";

import { getMovieFunctions } from "@features/movies/services/movies.service";

export function useMovieFunctions(movieId: number, cityId?: number) {
  return useQuery({
    queryKey: ["movieFunctions", movieId, cityId],
    queryFn: ({ signal }) => getMovieFunctions(movieId, cityId, signal),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
