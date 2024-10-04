import { motion } from "framer-motion";
import { Sketch } from "@uiw/react-color";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function ColorPaletteEditor({
  colorPalette,
  activeColor,
  setActiveColor,
  handleColorChange,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="my-6"
    >
      <h3 className="text-xl font-semibold mb-4 text-foreground">
        Color Palette
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(colorPalette).map(([key, color], index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-border"
          >
            <div
              className="h-16 w-full cursor-pointer"
              style={{ backgroundColor: color.value }}
              onClick={() => setActiveColor(key)}
            />
            <div className="p-3 bg-card">
              <p className="font-medium text-sm mb-1 text-card-foreground">
                {color.label}
              </p>
              <p className="text-xs text-muted-foreground">{color.value}</p>
            </div>
          </div>
        ))}
      </div>
      {activeColor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg shadow-xl">
            <Sketch
              color={colorPalette[activeColor].value}
              onChange={(color) => handleColorChange(color.hex, activeColor)}
            />
            <button
              className="mt-4 w-full bg-primary text-primary-foreground px-4 py-2 rounded-md"
              onClick={() => setActiveColor(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
