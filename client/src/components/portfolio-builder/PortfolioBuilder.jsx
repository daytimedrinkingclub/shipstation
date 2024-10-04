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

import { Fuel, Loader2, Sparkles } from "lucide-react";
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
import { ImageIcon } from "lucide-react";

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
  const [generatedWebsites, setGeneratedWebsites] = useState([]);
  const [isWebsitesDialogOpen, setIsWebsitesDialogOpen] = useState(false);

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

  useEffect(() => {
    if (isWebsitesDialogOpen) {
      fetchGeneratedWebsites();
    }
  }, [isWebsitesDialogOpen]);

  const fetchGeneratedWebsites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ships")
        .select("prompt, slug, portfolio_type, id")
        .order("id", { ascending: false })
        .limit(15);

      if (error) throw error;
      setGeneratedWebsites(data);
    } catch (error) {
      console.error("Error fetching generated websites:", error);
      toast.error("Failed to load generated websites");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebsiteSelection = (website) => {
    setCustomDesignPrompt(website.prompt);
    setIsWebsitesDialogOpen(false);
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
        navigate(`/project/${slug}`, { state: { initialPrompt: prompt } });
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
      className="mx-auto p-6 space-y-8 flex flex-col h-full w-full"
    >
      <h1 className="text-3xl font-bold mb-6">Build Your Portfolio</h1>

      <div className="space-y-6 flex-grow overflow-y-auto">
        <div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="pt-4">Custom Design Prompt</CardTitle>
              <CardDescription>
                Describe your ideal portfolio design
              </CardDescription>
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

        <div className="flex justify-between items-center mt-auto pt-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p
                  className={`text-sm ${
                    availableShips < 1 ? "text-destructive" : "text-foreground"
                  }`}
                  onClick={(e) => e.preventDefault()}
                >
                  <Fuel className="inline-block mr-2" height={18} width={18} />
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
          </TooltipProvider>
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
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogTitle className="text-foreground">
            Select a portfolio design
          </DialogTitle>
          <div className="flex-grow overflow-y-auto pr-4">
            <FocusCards
              cards={generatedWebsites.map((website) => ({
                src: `https://api.microlink.io?url=${baseUrl}/site/${website.slug}&screenshot=true&meta=false&embed=screenshot.url`,
                url: `${baseUrl}/site/${website.slug}`,
                onClick: () => handleWebsiteSelection(website),
              }))}
            />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
