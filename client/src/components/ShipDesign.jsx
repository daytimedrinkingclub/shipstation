import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HexColorPicker } from "react-colorful";
import { ChevronUp, ChevronDown } from "lucide-react";

const designLanguages = [
  { id: "minimal", name: "Minimal", image: "/placeholder.svg" },
  { id: "modern", name: "Modern", image: "/placeholder.svg" },
  { id: "classic", name: "Classic", image: "/placeholder.svg" },
  { id: "bold", name: "Bold", image: "/placeholder.svg" },
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
  const [selectedDesign, setSelectedDesign] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#10B981");
  const [accentColor, setAccentColor] = useState("#F59E0B");
  const [selectedFont, setSelectedFont] = useState("sans");
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(0);

  useEffect(() => {
    const palette = colorPalettes[currentPaletteIndex];
    setPrimaryColor(palette.colors[0]);
    setSecondaryColor(palette.colors[1]);
    setAccentColor(palette.colors[2]);
  }, [currentPaletteIndex]);

  const nextPalette = () => {
    setCurrentPaletteIndex(
      (prevIndex) => (prevIndex + 1) % colorPalettes.length
    );
  };

  const prevPalette = () => {
    setCurrentPaletteIndex(
      (prevIndex) =>
        (prevIndex - 1 + colorPalettes.length) % colorPalettes.length
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold">Website Design</h2>

      <Tabs defaultValue="language" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="language">Design Language</TabsTrigger>
          <TabsTrigger value="colors">Color Palette</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
        </TabsList>
        <TabsContent value="language" className="mt-4">
          <h3 className="text-xl font-semibold mb-4">
            Choose a Design Language
          </h3>
          <RadioGroup value={selectedDesign} onValueChange={setSelectedDesign}>
            <div className="grid grid-cols-2 gap-4">
              {designLanguages.map((design) => (
                <motion.div
                  key={design.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RadioGroupItem
                    value={design.id}
                    id={design.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={design.id}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <img
                      src={design.image}
                      alt={design.name}
                      className="w-full h-32 object-cover mb-2 rounded"
                    />
                    {design.name}
                  </Label>
                </motion.div>
              ))}
            </div>
          </RadioGroup>
        </TabsContent>
        <TabsContent value="colors" className="mt-4">
          <h3 className="text-xl font-semibold mb-4">Color Palette</h3>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={prevPalette}>
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <h4 className="font-semibold">
                  {colorPalettes[currentPaletteIndex].name}
                </h4>
                <div className="flex space-x-2 mt-2">
                  {colorPalettes[currentPaletteIndex].colors.map(
                    (color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={nextPalette}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <ColorPicker
                label="Primary Color"
                color={primaryColor}
                onChange={setPrimaryColor}
              />
              <ColorPicker
                label="Secondary Color"
                color={secondaryColor}
                onChange={setSecondaryColor}
              />
              <ColorPicker
                label="Accent Color"
                color={accentColor}
                onChange={setAccentColor}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="typography" className="mt-4">
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
        </TabsContent>
      </Tabs>

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

function ColorPicker({ label, color, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <HexColorPicker color={color} onChange={onChange} />
          <div
            className="absolute top-0 left-0 w-full h-full rounded-md"
            style={{ backgroundColor: color }}
          />
        </div>
        <Input
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-24"
        />
      </div>
    </div>
  );
}
