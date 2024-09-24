import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";

const designLanguages = [
  { id: "minimal", name: "Minimal", link: "https://example.com/minimal" },
  { id: "modern", name: "Modern", link: "https://example.com/modern" },
  { id: "classic", name: "Classic", link: "https://example.com/classic" },
  { id: "bold", name: "Bold", link: "https://example.com/bold" },
  {
    id: "neubrutalism",
    name: "Neubrutalism",
    link: "https://example.com/neubrutalism",
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    link: "https://example.com/glassmorphism",
  },
];

const fontOptions = [
  { id: "sans", name: "Sans-serif" },
  { id: "serif", name: "Serif" },
  { id: "mono", name: "Monospace" },
];

const colorPalettes = [
  {
    name: "Ocean Breeze",
    colors: ["#05445E", "#189AB4", "#75E6DA", "#D4F1F4"],
  },
  {
    name: "Sunset Vibes",
    colors: ["#F8B195", "#F67280", "#C06C84", "#6C5B7B"],
  },
  {
    name: "Forest Dream",
    colors: ["#2D6A4F", "#40916C", "#52B788", "#74C69D"],
  },
  {
    name: "Lavender Fields",
    colors: ["#7209B7", "#B5179E", "#F72585", "#3A0CA3"],
  },
  {
    name: "Citrus Punch",
    colors: ["#FF9F1C", "#FFBF69", "#CBF3F0", "#2EC4B6"],
  },
];

export default function ShipDesign() {
  const [selectedDesign, setSelectedDesign] = useState("minimal");
  const [primaryColor, setPrimaryColor] = useState("#05445E");
  const [secondaryColor, setSecondaryColor] = useState("#189AB4");
  const [accentColor, setAccentColor] = useState("#75E6DA");
  const [selectedFont, setSelectedFont] = useState("sans");
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(0);

  useEffect(() => {
    const palette = colorPalettes[currentPaletteIndex];
    setPrimaryColor(palette.colors[0]);
    setSecondaryColor(palette.colors[1]);
    setAccentColor(palette.colors[2]);
  }, [currentPaletteIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold">Website Design</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Choose a Design Language
          </h3>
          <RadioGroup value={selectedDesign} onValueChange={setSelectedDesign}>
            <div className="grid grid-cols-3 gap-4">
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
                      selectedDesign === design.id
                        ? "border-primary shadow-lg"
                        : "border-muted bg-background hover:border-primary hover:shadow-md"
                    }`}
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        {design.name}
                      </h3>
                      <a
                        href={design.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
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

        <div>
          <h3 className="text-xl font-semibold mb-4">Color Palette</h3>
          <RadioGroup
            value={currentPaletteIndex.toString()}
            onValueChange={(value) => setCurrentPaletteIndex(Number(value))}
          >
            <div className="grid grid-cols-3 gap-4">
              {colorPalettes.map((palette, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`palette-${index}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`palette-${index}`}
                    className={`block overflow-hidden rounded-xl border-2 transition-all duration-300 ease-in-out ${
                      currentPaletteIndex === index
                        ? "border-primary shadow-lg"
                        : "border-muted bg-background hover:border-primary hover:shadow-md"
                    }`}
                  >
                    <div className="p-4">
                      <h4 className="font-semibold text-center mb-2">
                        {palette.name}
                      </h4>
                      <div className="flex justify-center space-x-2">
                        {palette.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </Label>
                </motion.div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Typography</h3>
          <RadioGroup value={selectedFont} onValueChange={setSelectedFont}>
            <div className="space-y-2">
              {fontOptions.map((font) => (
                <div key={font.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={font.id} id={font.id} />
                  <Label htmlFor={font.id}>{font.name}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div
          className="rounded-md border border-muted-foreground overflow-hidden"
          style={{
            backgroundColor: primaryColor,
            color: secondaryColor,
            fontFamily:
              selectedFont === "sans"
                ? "sans-serif"
                : selectedFont === "serif"
                ? "serif"
                : "monospace",
          }}
        >
          <div
            className="p-4 bg-opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <h2 className="text-2xl font-bold mb-2">Welcome to Your Website</h2>
            <p className="text-sm opacity-80">
              This is a preview of your selected design.
            </p>
          </div>
          <div
            className="p-4 bg-opacity-70"
            style={{ backgroundColor: secondaryColor, color: primaryColor }}
          >
            <h3 className="text-xl font-semibold mb-2">Featured Content</h3>
            <p className="text-sm">
              Here's some sample text to showcase the typography and colors.
            </p>
          </div>
          <div
            className="p-4 flex justify-between items-center"
            style={{ backgroundColor: accentColor }}
          >
            <span className="text-sm font-bold" style={{ color: primaryColor }}>
              Call to Action
            </span>
            <Button
              className="text-xs"
              style={{ backgroundColor: primaryColor, color: secondaryColor }}
            >
              Click Me
            </Button>
          </div>
        </div>
      </div>

      <Button className="w-full">Apply Design</Button>
    </motion.div>
  );
}
