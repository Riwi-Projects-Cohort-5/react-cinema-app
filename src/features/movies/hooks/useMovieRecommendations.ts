import { useQuery } from "@tanstack/react-query";

import { getMovieRecommendations } from "@features/movies/services/movies.service";

export function useMovieRecommendations(movieId: number) {
  return useQuery({
    queryKey: ["movieRecommendations", movieId],
    queryFn: ({ signal }) => getMovieRecommendations(movieId, signal),
    staleTime: 600_000,
    refetchOnWindowFocus: false,
  });
}
