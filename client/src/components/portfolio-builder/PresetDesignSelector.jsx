import React from "react";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PresetDesignSelector({
  isLoading,
  designLanguages,
  selectedDesign,
  setSelectedDesign,
  setColorPalette,
  setFonts,
  setSelectedFont,
  setFontWeights,
}) {
  const handleDesignChange = (designId) => {
    const selectedPreset = designLanguages.find(
      (design) => design.id === designId
    );
    setSelectedDesign(selectedPreset);
    setColorPalette(selectedPreset.color_palette);
    setFonts(selectedPreset.fonts);
    setSelectedFont(selectedPreset.fonts[0]);

    const initialWeights = {};
    selectedPreset.fonts.forEach((font) => {
      initialWeights[font.name] = font.weights[0].toString();
    });
    setFontWeights(initialWeights);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">
          Choose a Design Language
        </h3>
        {isLoading ? (
          <DesignLanguageSkeleton />
        ) : (
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
        )}
      </div>
    </motion.div>
  );
}

const DesignLanguageSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-48 w-full rounded-xl" />
    ))}
  </div>
);
