import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sketch } from "@uiw/react-color";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { ExternalLink, Plus, Info, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSelector } from "react-redux";
import GoogleFontLoader from "react-google-font";
import { Skeleton } from "@/components/ui/skeleton";

import { useDispatch } from "react-redux";
import { setDesignLanguage } from "@/store/onboardingSlice";

import { cn } from "@/lib/utils";

export default function ShipDesign() {
  const [isLoading, setIsLoading] = useState(true);

  const [designLanguages, setDesignLanguages] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);

  const [colorPalette, setColorPalette] = useState({});
  const [activeColor, setActiveColor] = useState(null);

  const [selectedFont, setSelectedFont] = useState(null);
  const [customFont, setCustomFont] = useState("");
  const [fonts, setFonts] = useState([]);
  const [fontWeights, setFontWeights] = useState({});

  const dispatch = useDispatch();

  const shipType = useSelector((state) => state.onboarding.shipType);

  useEffect(() => {
    fetchDesignPresets();
  }, [shipType]);

  const fetchDesignPresets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("design_presets")
      .select(
        "id, design_name, sample_link, color_palette, fonts, design_description"
      )
      .eq("site_type", shipType);

    if (error) {
      console.error("Error fetching design presets:", error);
    } else {
      setDesignLanguages(data);
      if (data.length > 0) {
        setSelectedDesign(data[0]);
        setFonts(data[0].fonts);
        setSelectedFont(data[0].fonts[0]);
        setColorPalette(data[0].color_palette);
        // Initialize font weights
        const initialWeights = {};
        data[0].fonts.forEach((font) => {
          initialWeights[font.name] = font.weights[0].toString();
        });
        setFontWeights(initialWeights);
      }
    }
    setIsLoading(false);
  };

  const handleDesignChange = (designId) => {
    const selectedPreset = designLanguages.find(
      (design) => design.id === designId
    );
    setSelectedDesign(selectedPreset);
    setFonts(selectedPreset.fonts);
    setSelectedFont(selectedPreset.fonts[0]);
    setColorPalette(selectedPreset.color_palette);

    const initialWeights = {};
    selectedPreset.fonts.forEach((font) => {
      initialWeights[font.name] = font.weights[0].toString();
    });
    setFontWeights(initialWeights);

    // Dispatch the selected design language to Redux
    dispatch(setDesignLanguage(selectedPreset));
  };

  const handleFontChange = (fontName) => {
    const newSelectedFont = fonts.find((font) => font.name === fontName);
    setSelectedFont(newSelectedFont);

    const updatedDesign = {
      ...selectedDesign,
      fonts: fonts.map((font) =>
        font.name === fontName
          ? { ...font, selected: true }
          : { ...font, selected: false }
      ),
    };

    setSelectedDesign(updatedDesign);
    dispatch(setDesignLanguage(updatedDesign));
  };

  const handleColorChange = (newColor, colorKey) => {
    setColorPalette((prevPalette) => {
      const updatedPalette = {
        ...prevPalette,
        [colorKey]: {
          ...prevPalette[colorKey],
          value: newColor,
        },
      };

      const updatedDesign = {
        ...selectedDesign,
        color_palette: updatedPalette,
      };

      setSelectedDesign(updatedDesign);
      dispatch(setDesignLanguage(updatedDesign));

      return updatedPalette;
    });
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
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
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

      const updatedDesign = {
        ...selectedDesign,
        fonts: updatedFonts,
      };

      setSelectedDesign(updatedDesign);
      dispatch(setDesignLanguage(updatedDesign));

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
  };

  const weightOptions = [
    { value: "400", label: "Regular" },
    { value: "500", label: "Medium" },
    { value: "600", label: "Semibold" },
    { value: "700", label: "Bold" },
  ];

  // Prepare fonts for GoogleFontLoader
  const fontsToLoad = fonts.map((font) => ({
    font: font.name,
    weights: font.weights.map(Number),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <GoogleFontLoader fonts={fontsToLoad} />

      <h2 className="text-2xl font-bold">Ship Design</h2>

      <div className="space-y-8">
        {isLoading ? (
          <>
            <DesignLanguageSkeleton />
            <ColorPaletteSkeleton />
            <TypographySkeleton />
          </>
        ) : (
          <>
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Choose a Design Language
              </h3>
              <RadioGroup
                value={selectedDesign?.id}
                onValueChange={handleDesignChange}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {designLanguages.map((design) => (
                    <motion.div
                      key={design.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative h-full"
                    >
                      <RadioGroupItem
                        value={design.id}
                        id={design.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={design.id}
                        className={`block h-full overflow-hidden rounded-xl border-2 transition-all duration-300 ease-in-out ${
                          selectedDesign?.id === design.id
                            ? "border-primary shadow-md"
                            : "border-muted bg-background hover:border-primary hover:shadow-md"
                        }`}
                      >
                        <div className="p-6 flex flex-col h-full">
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {design.design_name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 flex-grow">
                            {design.design_description}
                          </p>
                          <a
                            href={design.sample_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-auto"
                          >
                            View Example Site
                            <ExternalLink className="ml-1 h-4 w-4" />
                          </a>
                        </div>
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {selectedDesign && (
              <>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Color Palette</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(colorPalette).map(([key, color], index) => (
                      <div
                        key={index}
                        className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <div
                          className="h-16 w-full cursor-pointer"
                          style={{ backgroundColor: color.value }}
                          onClick={() => setActiveColor(key)}
                        />
                        <div className="p-3 bg-background">
                          <p className="font-medium text-sm mb-1">
                            {color.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {color.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {activeColor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-background p-4 rounded-lg shadow-xl">
                        <Sketch
                          color={colorPalette[activeColor].value}
                          onChange={(color) =>
                            handleColorChange(color.hex, activeColor)
                          }
                        />
                        <Button
                          className="mt-4 w-full"
                          onClick={() => setActiveColor(null)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Typography</h3>
                  <div className="flex items-center space-x-2 mb-4">
                    <Input
                      placeholder="Add a Google Font name like Luna"
                      value={customFont}
                      onChange={(e) => setCustomFont(e.target.value)}
                      onKeyDown={handleCustomFontKeyDown}
                      className="w-64"
                    />
                    <Button onClick={handleAddCustomFont} size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Add Font
                    </Button>
                    <Button
                      onClick={() => {
                        window.open("https://fonts.google.com/", "_blank");
                      }}
                      variant="outline"
                    >
                      Browse Fonts <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <RadioGroup
                    value={selectedFont?.name}
                    onValueChange={handleFontChange}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {fonts.map((font, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative"
                        >
                          <RadioGroupItem
                            value={font.name}
                            id={`font-${font.name}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`font-${font.name}`}
                            className={`block overflow-hidden rounded-xl border-2 bg-muted transition-all duration-300 ease-in-out h-full ${
                              selectedFont?.name === font.name
                                ? "border-primary shadow-md"
                                : "border-transparent hover:border-primary hover:shadow-md"
                            }`}
                          >
                            <div className="p-6 flex flex-col h-full">
                              <div className="flex flex-col mb-2 flex-grow">
                                <h4
                                  className="text-lg font-semibold text-primary truncate"
                                  title={font.name}
                                >
                                  {font.name}
                                </h4>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {weightOptions.map((option) => (
                                    <button
                                      key={option.value}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleFontWeightChange(
                                          font.name,
                                          option.value
                                        );
                                      }}
                                      className={cn(
                                        "weight-button px-2 py-1 text-xs rounded-md transition-colors",
                                        fontWeights[font.name] === option.value
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-secondary text-secondary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                      )}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <p
                                style={{
                                  fontFamily: `'${font.name}', sans-serif`,
                                  fontSize: "1.25rem",
                                  fontWeight: fontWeights[font.name],
                                  lineHeight: 1.2,
                                }}
                                className="mt-4 overflow-hidden text-ellipsis"
                              >
                                The quick brown fox jumps over the lazy dog
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Font from Google Fonts
                              </p>
                            </div>
                          </Label>
                        </motion.div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

const DesignLanguageSkeleton = () => (
  <div>
    <Skeleton className="h-8 w-64 mb-4" />
    <div className="grid grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

const ColorPaletteSkeleton = () => (
  <div>
    <Skeleton className="h-8 w-64 mb-4" />
    <div className="flex inline-flex rounded-lg overflow-hidden">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="w-12 h-24" />
      ))}
    </div>
  </div>
);

const TypographySkeleton = () => (
  <div>
    <Skeleton className="h-8 w-64 mb-4" />
    <div className="grid grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <Skeleton key={i} className="h-40 w-full rounded-lg" />
      ))}
    </div>
  </div>
);
