import React, { useState, useEffect, useContext, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSocket } from "@/context/SocketProvider";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useDisclosure from "@/hooks/useDisclosure";
import ChoosePaymentOptionDialog from "../ChoosePaymentOptionDialog";

import { DraftingCompass, Fuel, Loader2, Sparkles, Heart } from "lucide-react";
import { pluralize } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDispatch } from "react-redux";
import { setIsDeploying } from "@/store/deploymentSlice";
import CustomDesignPrompt from "./CustomDesignPrompt";
import PortfolioTypeSelector from "./PortfolioTypeSelector";
import { supabase } from "@/lib/supabaseClient";
import { FocusCards } from "@/components/ui/focus-cards";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useInView } from "react-intersection-observer";
import { fetchGeneratedWebsites } from "@/lib/utils/portfolioUtils";
import MobilePortfolioBuilder from "./MobilePortfolioBuilder";
import { useProject } from "@/hooks/useProject";

export default function PortfolioBuilder() {
  const { socket, roomId } = useSocket();
  const { user, availableShips, anthropicKey, setAnthropicKey } =
    useContext(AuthContext);
  const userId = user?.id;

  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [customDesignPrompt, setCustomDesignPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioType, setPortfolioType] = useState("Developer");
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [deployedWebsiteSlug, setDeployedWebsiteSlug] = useState("");
  const [isKeyValidating, setIsKeyValidating] = useState(false);
  const [page, setPage] = useState(1);
  const [allGeneratedWebsites, setAllGeneratedWebsites] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isWebsitesDialogOpen, setIsWebsitesDialogOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const { likeWebsite, unlikeWebsite } = useProject();

  const baseUrl = import.meta.env.VITE_MAIN_URL; //https://shipstation.ai

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isLoaderOpen,
    onOpen: onLoaderOpen,
    onClose: onLoaderClose,
  } = useDisclosure();
  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();

  const navigate = useNavigate();

  const loadGeneratedWebsites = useCallback(
    async (pageNumber = 1) => {
      if (!hasMore && pageNumber !== 1) return;

      setIsLoading(true);
      try {
        const data = await fetchGeneratedWebsites(pageNumber, 15, user?.id);

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
    [user?.id, hasMore]
  );

  useEffect(() => {
    if (isWebsitesDialogOpen) {
      loadGeneratedWebsites(1);
    }
  }, [isWebsitesDialogOpen, loadGeneratedWebsites]);

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      loadGeneratedWebsites(currentPage + 1);
    }
  }, [inView, isLoading, hasMore, currentPage, loadGeneratedWebsites]);

  const handleLikeWebsite = async (website, pageNumber) => {
    if (!user) {
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

  const handleWebsiteSelection = (website) => {
    setCustomDesignPrompt(website.prompt);
    setIsWebsitesDialogOpen(false);
    toast.success("Prompt selected and applied!");
  };

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!customDesignPrompt.trim()) {
      toast.error("Please describe your desired design");
      return;
    }

    if (availableShips <= 0) {
      setIsPaymentRequired(true);
      onOpen();
      return;
    }

    setIsGenerating(true);

    const portfolioData = {
      shipType: "portfolio",
      name,
      portfolioType,
      designChoice: "custom",
      customDesignPrompt: customDesignPrompt,
    };

    socket.emit("startProject", {
      roomId,
      userId,
      apiKey: anthropicKey,
      ...portfolioData,
    });

    onLoaderOpen();
  }, [
    name,
    customDesignPrompt,
    availableShips,
    portfolioType,
    anthropicKey,
    roomId,
    userId,
  ]);

  useEffect(() => {
    if (socket) {
      socket.on("apiKeyStatus", (response) => {
        setIsKeyValidating(false);
        if (response.success) {
          if (isPaymentRequired) {
            setIsPaymentRequired(false);
            handleSubmit();
          }
          toast.success("Anthropic key is valid, starting generation!");
        } else {
          toast.error(response.message);
        }
      });

      socket.on("showPaymentOptions", ({ error }) => {
        setIsPaymentRequired(true);
        onOpen();
      });

      socket.on("needMoreInfo", ({ message }) => {
        toast.warning("Please add more details regarding the website");
        onLoaderClose();
      });

      socket.on("project_started", (data) => {
        const { slug, prompt } = data;
        dispatch(setIsDeploying(true));
        navigate("/editor", { state: { shipId: slug, initialPrompt: prompt } });
      });

      socket.on("websiteDeployed", ({ slug }) => {
        onSuccessOpen();
        onLoaderClose();
        setDeployedWebsiteSlug(slug);
      });

      return () => {
        socket.off("apiKeyStatus");
        socket.off("showPaymentOptions");
        socket.off("websiteDeployed");
        socket.off("needMoreInfo");
      };
    }
  }, [socket, isPaymentRequired, navigate]);

  const handleSubmitAnthropicKey = (apiKey) => {
    socket.emit("anthropicKey", { anthropicKey: apiKey });
    setIsKeyValidating(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-4 md:p-6 space-y-4 md:space-y-8 flex flex-col h-full w-full"
    >
      <h1 className="text-2xl md:text-3xl font-bold">Start your project</h1>
      <div className="space-y-4 md:space-y-6 flex-grow overflow-y-auto">
        {/* Desktop view */}
        <div className="hidden md:block">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-4 block">Your Name</h2>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1 w-1/2"
              disabled={isGenerating}
            />
          </div>

          <PortfolioTypeSelector
            portfolioType={portfolioType}
            setPortfolioType={setPortfolioType}
            isGenerating={isGenerating}
          />

          <div className="grid grid-cols-1 gap-6">
            {/* Commented out first card
          <Card
            className="relative cursor-pointer overflow-hidden h-full bg-gray-50 dark:bg-gray-800 transition-all duration-300 ease-in-out hover:shadow-lg group"
            onClick={() => setIsWebsitesDialogOpen(true)}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 ease-in-out bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer" />
            <CardContent className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6">
              <ImageIcon className="w-12 h-12 mb-4 text-gray-400" />
              <CardTitle className="text-xl font-semibold mb-2">
                Browse Design Inspirations
              </CardTitle>
              <CardDescription className="mb-6">
                Get inspired by existing portfolio designs
              </CardDescription>
              <Button disabled={isGenerating}>View Inspirations</Button>
            </CardContent>
          </Card>
          */}
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="pt-4">Custom Design Prompt</CardTitle>
                  <CardDescription>
                    Describe your ideal portfolio design or select a design from
                    the gallery
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsWebsitesDialogOpen(true)}
                  disabled={isGenerating}
                  size="sm"
                >
                  <DraftingCompass className="mr-2 h-4 w-4" />
                  Open Prompt Gallery
                </Button>
              </CardHeader>
              <CardContent>
                <CustomDesignPrompt
                  customDesignPrompt={customDesignPrompt}
                  setCustomDesignPrompt={setCustomDesignPrompt}
                  isGenerating={isGenerating}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-end mt-auto pt-4">
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p
                    className={`text-sm ${
                      availableShips < 1
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                    onClick={(e) => e.preventDefault()}
                  >
                    <Fuel
                      className="inline-block mr-2"
                      height={18}
                      width={18}
                    />
                    {availableShips} {pluralize(availableShips, "container")}{" "}
                    available
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  Your balance is {availableShips}{" "}
                  {pluralize(availableShips, "container")}. <br />1 container is
                  equal to 1 individual portfolio.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
            <div />
            <Button
              onClick={handleSubmit}
              disabled={availableShips <= 0 || isGenerating}
              className="relative"
            >
              {isGenerating ? (
                <>
                  Generating...
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : availableShips > 0 ? (
                <>
                  Generate Portfolio
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              ) : (
                "No ships available"
              )}
              {availableShips <= 0 && !isGenerating && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/80 text-foreground text-sm font-medium">
                  Get more ships
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          <MobilePortfolioBuilder
            name={name}
            setName={setName}
            portfolioType={portfolioType}
            setPortfolioType={setPortfolioType}
            customDesignPrompt={customDesignPrompt}
            setCustomDesignPrompt={setCustomDesignPrompt}
            isGenerating={isGenerating}
            handleSubmit={handleSubmit}
            onOpenPromptGallery={() => setIsWebsitesDialogOpen(true)}
            availableShips={availableShips}
          />
        </div>
      </div>

      <ChoosePaymentOptionDialog
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setIsPaymentRequired(false);
        }}
        onSubmitKey={handleSubmitAnthropicKey}
        anthropicKey={anthropicKey}
        setAnthropicKey={setAnthropicKey}
        type="portfolio"
        isKeyValidating={isKeyValidating}
      />

      <Dialog
        open={isWebsitesDialogOpen}
        onOpenChange={setIsWebsitesDialogOpen}
      >
        <DialogContent className="max-w-[90vw] max-h-[80vh] md:max-h-[90vh] overflow-hidden flex flex-col my-4 md:my-0 rounded-lg">
          <DialogTitle className="text-foreground">
            Select a portfolio design
          </DialogTitle>
          <div className="flex-grow overflow-y-auto pr-4">
            <FocusCards
              cards={Object.entries(allGeneratedWebsites).flatMap(
                ([pageNumber, websites]) =>
                  websites.map((website) => ({
                    key: `${website.slug}-${pageNumber}`,
                    src: `${
                      import.meta.env.VITE_SUPABASE_URL
                    }/storage/v1/object/public/shipstation-websites/websites/${
                      website.slug
                    }/screenshot.png`,
                    url: `${baseUrl}/site/${website.slug}`,
                    onClick: () => handleWebsiteSelection(website),
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
              )}
            />
            {isLoading && (
              <div className="flex justify-center items-center mt-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {!isLoading && hasMore && <div ref={ref} className="h-10" />}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
