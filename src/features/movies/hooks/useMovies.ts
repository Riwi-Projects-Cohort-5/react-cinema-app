import { useQuery } from "@tanstack/react-query";

import { getMovies } from "@features/movies/services/movies.service";

export function useMovies() {
  return useQuery({
    queryKey: ["movies"],
    queryFn: ({ signal }) => getMovies(signal),
    staleTime: 600_000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
}
