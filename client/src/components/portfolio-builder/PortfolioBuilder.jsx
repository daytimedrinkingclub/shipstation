import React, { useState, useEffect, useContext, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/SocketProvider";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useDisclosure from "@/hooks/useDisclosure";
import ChoosePaymentOptionDialog from "../ChoosePaymentOptionDialog";
import { DraftingCompass, Fuel, Loader2, Sparkles, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { setIsDeploying } from "@/store/deploymentSlice";
import CustomDesignPrompt from "./CustomDesignPrompt";
import PortfolioTypeSelector from "./PortfolioTypeSelector";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import MobilePortfolioBuilder from "./MobilePortfolioBuilder";
import WebsiteGallery from "./WebsiteGallery";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function PortfolioBuilder() {
  const { socket, roomId } = useSocket();
  const { user, availableShips, anthropicKey, setAnthropicKey } =
    useContext(AuthContext);
  const userId = user?.id;

  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [customDesignPrompt, setCustomDesignPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [portfolioType, setPortfolioType] = useState("Developer");
  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [deployedWebsiteSlug, setDeployedWebsiteSlug] = useState("");
  const [isKeyValidating, setIsKeyValidating] = useState(false);
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

  const isMobile = useMediaQuery("(max-width: 768px)");

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
        {isMobile ? (
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
        ) : (
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
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="pt-4">Custom Design Prompt</CardTitle>
                    <CardDescription>
                      Describe your ideal portfolio design or select a design
                      from the gallery
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
        )}
      </div>

      {isMobile ? (
        <div
          className={`fixed inset-0 bg-background z-50 ${
            isWebsitesDialogOpen ? "block" : "hidden"
          }`}
        >
          <div className="flex flex-col h-full relative">
            <div className="absolute top-4 right-4 z-30">
              <Button
                variant="outline"
                onClick={() => setIsWebsitesDialogOpen(false)}
                className="flex items-center"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-grow overflow-y-auto">
              <WebsiteGallery
                userId={user?.id}
                onSelectWebsite={handleWebsiteSelection}
                baseUrl={baseUrl}
              />
            </div>
          </div>
        </div>
      ) : (
        <Dialog
          open={isWebsitesDialogOpen}
          onOpenChange={setIsWebsitesDialogOpen}
        >
          <DialogContent className="max-w-[90vw] max-h-[80vh] md:max-h-[90vh] overflow-hidden flex flex-col my-4 md:my-0 rounded-lg">
            <WebsiteGallery
              userId={user?.id}
              onSelectWebsite={handleWebsiteSelection}
              baseUrl={baseUrl}
            />
          </DialogContent>
        </Dialog>
      )}

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
    </motion.div>
  );
}
