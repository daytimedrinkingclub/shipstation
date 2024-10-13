import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { FocusCards } from "@/components/ui/focus-cards";
import { Loader2, Heart } from "lucide-react";
import { fetchGeneratedWebsites } from "@/lib/utils/portfolioUtils";
import { toast } from "sonner";
import { useProject } from "@/hooks/useProject";
import { Switch } from "@/components/ui/switch";

const WebsiteGallery = ({ userId, onSelectWebsite, baseUrl }) => {
  const [allGeneratedWebsites, setAllGeneratedWebsites] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0,
  });
  const [showLikedOnly, setShowLikedOnly] = useState(false);

  const { likeWebsite, unlikeWebsite } = useProject();

  const loadGeneratedWebsites = useCallback(
    async (pageNumber = 1) => {
      if (!hasMore && pageNumber !== 1) return;

      setIsLoading(true);
      try {
        const data = await fetchGeneratedWebsites(pageNumber, 15, userId);

        setAllGeneratedWebsites((prev) => ({
          ...prev,
          [pageNumber]: data.websites,
        }));

        setHasMore(data.hasMore);
        setCurrentPage(pageNumber);
      } catch (error) {
        console.error("Error fetching generated websites:", error);
        toast.error("Failed to load generated websites");
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadGeneratedWebsites(1);
  }, [loadGeneratedWebsites]);

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      loadGeneratedWebsites(currentPage + 1);
    }
  }, [inView, isLoading, hasMore, currentPage, loadGeneratedWebsites]);

  const handleLikeWebsite = async (website, pageNumber) => {
    if (!userId) {
      toast.error("Please log in to like websites");
      return;
    }

    try {
      const isLiked = website.is_liked_by_user;
      const action = isLiked ? unlikeWebsite : likeWebsite;

      await action(website.slug);

      setAllGeneratedWebsites((prev) => ({
        ...prev,
        [pageNumber]: prev[pageNumber].map((w) =>
          w.slug === website.slug
            ? {
                ...w,
                likes_count: isLiked ? w.likes_count - 1 : w.likes_count + 1,
                is_liked_by_user: !isLiked,
              }
            : w
        ),
      }));

      toast.success(isLiked ? "Website unliked" : "Website liked");
    } catch (error) {
      console.error("Error updating like:", error);
      toast.error("Failed to update like");
    }
  };

  const filteredWebsites = useCallback(() => {
    return Object.entries(allGeneratedWebsites).flatMap(
      ([pageNumber, websites]) =>
        websites
          .filter((website) => !showLikedOnly || website.is_liked_by_user)
          .map((website) => ({
            key: `${website.slug}-${pageNumber}`,
            src: `${
              import.meta.env.VITE_SUPABASE_URL
            }/storage/v1/object/public/shipstation-websites/websites/${
              website.slug
            }/screenshot.png`,
            url: `${baseUrl}/site/${website.slug}`,
            onClick: () => onSelectWebsite(website),
            likeButton: (
              <Button
                key={`like-${website.slug}-${pageNumber}`}
                size="sm"
                variant="ghost"
                className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikeWebsite(website, pageNumber);
                }}
              >
                <Heart
                  className={`h-5 w-5 ${
                    website.is_liked_by_user
                      ? "fill-current text-red-500"
                      : "text-gray-500"
                  }`}
                />
                <span className="ml-1 text-gray-700 dark:text-gray-300">
                  {website.likes_count}
                </span>
              </Button>
            ),
          }))
    );
  }, [
    allGeneratedWebsites,
    showLikedOnly,
    baseUrl,
    onSelectWebsite,
    handleLikeWebsite,
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 md:px-0 space-y-4 sm:space-y-0 bg-background">
        <h2 className="text-xl font-semibold text-foreground">
          Select a portfolio design
        </h2>
        <div className="flex items-center space-x-3 bg-secondary/50 rounded-full px-4 py-2">
          <span className="text-sm font-medium text-foreground">
            Show liked only
          </span>
          <Switch
            checked={showLikedOnly}
            onCheckedChange={setShowLikedOnly}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="p-4 md:px-0">
          <FocusCards cards={filteredWebsites()} />
        </div>
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {!isLoading && hasMore && <div ref={ref} className="h-10" />}
      </div>
    </div>
  );
};

export default WebsiteGallery;
