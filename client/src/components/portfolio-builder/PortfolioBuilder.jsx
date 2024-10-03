import React, { useState, useEffect, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSocket } from "@/context/SocketProvider";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useDisclosure from "@/hooks/useDisclosure";
import ChoosePaymentOptionDialog from "../ChoosePaymentOptionDialog";
import LoadingGameOverlay from "../LoadingGameOverlay";
import SuccessOverlay from "../SuccessOverlay";
import GoogleFontLoader from "react-google-font";
import { Fuel, Sparkles } from "lucide-react";
import { pluralize } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import DesignApproachSelector from "./DesignApproachSelector";
import CustomDesignPrompt from "./CustomDesignPrompt";
import PresetDesignSelector from "./PresetDesignSelector";
import ColorPaletteEditor from "./ColorPaletteEditor";
import FontSelector from "./FontSelector";
import PortfolioTypeSelector from "./PortfolioTypeSelector";
import { supabase } from "@/lib/supabaseClient";

export default function PortfolioBuilder() {
  const { socket, roomId } = useSocket();
  const { user, availableShips, anthropicKey, setAnthropicKey } =
    useContext(AuthContext);
  const userId = user?.id;

  const [name, setName] = useState("");
  const [designChoice, setDesignChoice] = useState("custom");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [customDesignPrompt, setCustomDesignPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [designLanguages, setDesignLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colorPalette, setColorPalette] = useState({});
  const [activeColor, setActiveColor] = useState(null);
  const [fonts, setFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState(null);
  const [customFont, setCustomFont] = useState("");
  const [fontWeights, setFontWeights] = useState({});
  const [portfolioType, setPortfolioType] = useState("Developer");

  const [isPaymentRequired, setIsPaymentRequired] = useState(false);
  const [deployedWebsiteSlug, setDeployedWebsiteSlug] = useState("");
  const [isKeyValidating, setIsKeyValidating] = useState(false);

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
    if (designChoice === "preset") {
      fetchDesignPresets();
    } else {
      // Reset preset-related states when switching to custom
      setSelectedDesign(null);
      setColorPalette({});
      setFonts([]);
      setSelectedFont(null);
      setCustomFont("");
      setFontWeights({});
    }
  }, [designChoice]);

  const fetchDesignPresets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("design_presets")
      .select(
        "id, design_name, sample_link, design_description, color_palette, fonts"
      )
      .eq("site_type", "portfolio");

    if (error) {
      console.error("Error fetching design presets:", error);
      toast.error("Failed to load design presets");
    } else {
      setDesignLanguages(data);
      if (data.length > 0) {
        setSelectedDesign(data[0]);
        setColorPalette(data[0].color_palette);
        setFonts(data[0].fonts);
        setSelectedFont(data[0].fonts[0]);
        const initialWeights = {};
        data[0].fonts.forEach((font) => {
          initialWeights[font.name] = font.weights[0].toString();
        });
        setFontWeights(initialWeights);
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (designChoice === "preset" && !selectedDesign) {
      toast.error("Please select a design");
      return;
    }

    if (designChoice === "custom" && !customDesignPrompt.trim()) {
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
      designChoice,
      selectedDesign: designChoice === "preset" ? selectedDesign : null,
      customDesignPrompt: designChoice === "custom" ? customDesignPrompt : null,
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
    designChoice,
    selectedDesign,
    customDesignPrompt,
    availableShips,
    portfolioType,
    anthropicKey,
    roomId,
    userId,
  ]);

  const handleColorChange = (newColor, colorKey) => {
    setColorPalette((prevPalette) => {
      const updatedPalette = {
        ...prevPalette,
        [colorKey]: { ...prevPalette[colorKey], value: newColor },
      };

      // Update selectedDesign with the new color palette
      setSelectedDesign((prevDesign) => ({
        ...prevDesign,
        color_palette: updatedPalette,
      }));

      return updatedPalette;
    });
  };

  const handleFontChange = (fontName) => {
    const newSelectedFont = fonts.find((font) => font.name === fontName);
    setSelectedFont(newSelectedFont);

    // Update selectedDesign with the new selected font
    setSelectedDesign((prevDesign) => ({
      ...prevDesign,
      fonts: prevDesign.fonts.map((font) => ({
        ...font,
        selected: font.name === fontName,
      })),
    }));
  };

  const handleAddCustomFont = () => {
    if (
      customFont &&
      !fonts.some(
        (font) => font.name.toLowerCase() === customFont.toLowerCase()
      )
    ) {
      const capitalizedFontName = customFont
        .trim()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const newFont = {
        name: capitalizedFontName,
        weights: [400, 500, 600, 700],
        selected: true,
      };

      const updatedFonts = [...fonts, newFont];
      setFonts(updatedFonts);
      setSelectedFont(newFont);
      setFontWeights((prevWeights) => ({
        ...prevWeights,
        [capitalizedFontName]: "400",
      }));

      // Update selectedDesign with the new font
      setSelectedDesign((prevDesign) => ({
        ...prevDesign,
        fonts: updatedFonts.map((font) => ({
          ...font,
          selected: font.name === capitalizedFontName,
        })),
      }));

      setCustomFont("");
    }
  };

  const handleCustomFontKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomFont();
    }
  };

  const handleFontWeightChange = (fontName, weight) => {
    setFontWeights((prevWeights) => ({
      ...prevWeights,
      [fontName]: weight,
    }));

    // Update selectedDesign with the new font weight
    setSelectedDesign((prevDesign) => ({
      ...prevDesign,
      fonts: prevDesign.fonts.map((font) =>
        font.name === fontName ? { ...font, selectedWeight: weight } : font
      ),
    }));
  };

  const fontsToLoad = fonts.map((font) => ({
    font: font.name,
    weights: font.weights.map(Number),
  }));

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
  }, [socket, isPaymentRequired]);

  const handleSubmitAnthropicKey = (apiKey) => {
    socket.emit("anthropicKey", { anthropicKey: apiKey });
    setIsKeyValidating(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-6 space-y-8"
    >
      <GoogleFontLoader fonts={fontsToLoad} />

      <h1 className="text-3xl font-bold mb-6">Build Your Portfolio</h1>

      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="mt-1 w-1/2"
          />
        </div>

        <PortfolioTypeSelector
          portfolioType={portfolioType}
          setPortfolioType={setPortfolioType}
        />

        <DesignApproachSelector
          designChoice={designChoice}
          setDesignChoice={setDesignChoice}
        />

        <AnimatePresence mode="wait">
          {designChoice === "custom" ? (
            <CustomDesignPrompt
              key="custom"
              customDesignPrompt={customDesignPrompt}
              setCustomDesignPrompt={setCustomDesignPrompt}
            />
          ) : (
            <motion.div
              key="preset"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PresetDesignSelector
                isLoading={isLoading}
                designLanguages={designLanguages}
                selectedDesign={selectedDesign}
                setSelectedDesign={setSelectedDesign}
                setColorPalette={setColorPalette}
                setFonts={setFonts}
                setSelectedFont={setSelectedFont}
                setFontWeights={setFontWeights}
              />
              {selectedDesign && (
                <>
                  <ColorPaletteEditor
                    colorPalette={colorPalette}
                    activeColor={activeColor}
                    setActiveColor={setActiveColor}
                    handleColorChange={handleColorChange}
                  />
                  <FontSelector
                    fonts={fonts}
                    selectedFont={selectedFont}
                    handleFontChange={handleFontChange}
                    customFont={customFont}
                    setCustomFont={setCustomFont}
                    handleAddCustomFont={handleAddCustomFont}
                    handleCustomFontKeyDown={handleCustomFontKeyDown}
                    fontWeights={fontWeights}
                    handleFontWeightChange={handleFontWeightChange}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mt-4">
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
            disabled={availableShips <= 0}
            className="relative"
          >
            {availableShips > 0 ? (
              <>
                Generate Portfolio
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            ) : (
              "No ships available"
            )}
            {availableShips <= 0 && (
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
      {isLoaderOpen && (
        <LoadingGameOverlay isOpen={isLoaderOpen} type="portfolio" />
      )}
      <SuccessOverlay
        isOpen={isSuccessOpen}
        onClose={() => navigate("/")}
        slug={deployedWebsiteSlug}
      />
    </motion.div>
  );
}
