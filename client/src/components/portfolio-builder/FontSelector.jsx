import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FontSelector({
  fonts,
  selectedFont,
  handleFontChange,
  customFont,
  setCustomFont,
  handleAddCustomFont,
  handleCustomFontKeyDown,
  fontWeights,
  handleFontWeightChange,
}) {
  const weightOptions = [
    { value: "400", label: "Regular" },
    { value: "500", label: "Medium" },
    { value: "600", label: "SemiBold" },
    { value: "700", label: "Bold" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-semibold mb-4 text-foreground">Typography</h3>
      <div className="flex items-center space-x-2 mb-4">
        <Input
          placeholder="Add a Google Font name like Luna"
          value={customFont}
          onChange={(e) => setCustomFont(e.target.value)}
          onKeyDown={handleCustomFontKeyDown}
          className="w-64 text-foreground placeholder:text-muted-foreground"
        />
        <Button onClick={handleAddCustomFont} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Font
        </Button>
        <Button
          onClick={() => {
            window.open("https://fonts.google.com/", "_blank");
          }}
          variant="outline"
          className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Browse Fonts <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <RadioGroup value={selectedFont?.name} onValueChange={handleFontChange}>
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
                className={`block overflow-hidden rounded-xl border-2 bg-card transition-all duration-300 ease-in-out h-full ${
                  selectedFont?.name === font.name
                    ? "border-primary shadow-md"
                    : "border-muted hover:border-primary hover:shadow-md"
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
                            handleFontWeightChange(font.name, option.value);
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
                    className="mt-4 overflow-hidden text-ellipsis text-card-foreground"
                  >
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              </Label>
            </motion.div>
          ))}
        </div>
      </RadioGroup>
    </motion.div>
  );
}
