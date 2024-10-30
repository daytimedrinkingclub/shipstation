import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchGeneratedWebsites } from "@/lib/utils/portfolioUtils";

export function useWebsites(userId, limit = 15) {
  return useInfiniteQuery({
    queryKey: ["websites", userId],
    queryFn: ({ pageParam = 1 }) => fetchGeneratedWebsites(pageParam, limit, userId),
    staleTime: 1000 * 60 * 60, // 1 hour
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? lastPage.nextPage : undefined,
    initialPageParam: 1,
  });
}
