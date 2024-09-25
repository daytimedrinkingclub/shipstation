import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sketch } from "@uiw/react-color";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";
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

export default function ShipDesign() {
  const [designLanguages, setDesignLanguages] = useState([]);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [selectedFont, setSelectedFont] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [colorPalette, setColorPalette] = useState({});
  const [activeColor, setActiveColor] = useState(null);

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
        setSelectedFont(data[0].fonts[0]);
        setColorPalette(data[0].color_palette);
      }
    }
    setIsLoading(false);
  };

  const handleDesignChange = (designId) => {
    const selectedPreset = designLanguages.find(
      (design) => design.id === designId
    );
    setSelectedDesign(selectedPreset);
    setSelectedFont(selectedPreset.fonts[0]);
    setColorPalette(selectedPreset.color_palette);
  };

  const handleFontChange = (fontName) => {
    const newSelectedFont = selectedDesign.fonts.find(
      (font) => font.name === fontName
    );
    setSelectedFont(newSelectedFont);
  };

  const handleColorChange = (newColor, colorKey) => {
    setColorPalette((prevPalette) => ({
      ...prevPalette,
      [colorKey]: newColor,
    }));
  };

  // Prepare fonts for GoogleFontLoader
  const fontsToLoad = designLanguages.reduce((acc, design) => {
    if (Array.isArray(design.fonts)) {
      design.fonts.forEach((font) => {
        acc.push({
          font: font.name,
          weights: font.weights.map(Number),
        });
      });
    }
    return acc;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <GoogleFontLoader fonts={fontsToLoad} />

      <h2 className="text-2xl font-bold">Website Design</h2>

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
                <div className="grid grid-cols-2 gap-6">
                  {designLanguages.map((design) => (
                    <motion.div
                      key={design.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <RadioGroupItem
                        value={design.id}
                        id={design.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={design.id}
                        className={`block overflow-hidden rounded-xl border-2 transition-all duration-300 ease-in-out ${
                          selectedDesign?.id === design.id
                            ? "border-primary shadow-md"
                            : "border-muted bg-background hover:border-primary hover:shadow-md"
                        }`}
                      >
                        <div className="p-6">
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {design.design_name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {design.design_description}
                          </p>
                          <a
                            href={design.sample_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
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
                  <div className="flex inline-flex rounded-lg overflow-hidden">
                    {Object.entries(colorPalette).map(([key, color], index) => (
                      <TooltipProvider key={index}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger>
                            <div
                              className="w-12 h-24 relative"
                              style={{ backgroundColor: color }}
                              onClick={() => setActiveColor(key)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {key}: {color}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                  {activeColor && (
                    <div className="absolute z-10 mt-2">
                      <div
                        className="fixed inset-0"
                        onClick={() => setActiveColor(null)}
                      />
                      <Sketch
                        color={colorPalette[activeColor]}
                        onChange={(color) =>
                          handleColorChange(color.hex, activeColor)
                        }
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Typography</h3>
                  <RadioGroup
                    value={selectedFont?.name}
                    onValueChange={handleFontChange}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.isArray(selectedDesign.fonts) &&
                        selectedDesign.fonts.map((font, index) => (
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
                              className={`block overflow-hidden rounded-xl border-2 bg-muted transition-all duration-300 ease-in-out ${
                                selectedFont?.name === font.name
                                  ? "border-primary shadow-md"
                                  : "border-transparent hover:border-primary hover:shadow-md"
                              }`}
                            >
                              <div className="p-6">
                                <h4 className="text-lg font-semibold text-primary mb-2">
                                  {font.name}
                                </h4>
                                <p
                                  style={{
                                    fontFamily: `'${font.name}', sans-serif`,
                                    fontSize: "1.5rem",
                                  }}
                                >
                                  The quick brown fox jumps over the lazy dog
                                </p>
                                <span className="text-sm text-muted-foreground mt-2 block">
                                  Weights: {font.weights.join(", ")}
                                </span>
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
