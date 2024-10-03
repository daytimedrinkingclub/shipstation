import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function CustomDesignPrompt({
  customDesignPrompt,
  setCustomDesignPrompt,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <Label htmlFor="customDesign">Describe Your Desired Design</Label>
        <Textarea
          id="customDesign"
          value={customDesignPrompt}
          onChange={(e) => setCustomDesignPrompt(e.target.value)}
          placeholder="Describe the style, colors, and feel of your desired portfolio design"
          rows={4}
          className="mt-1"
        />
      </div>
    </motion.div>
  );
}
