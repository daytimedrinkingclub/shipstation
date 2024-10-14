import { Textarea } from "@/components/ui/textarea";

export default function CustomDesignPrompt({
  customDesignPrompt,
  setCustomDesignPrompt,
  isGenerating,
  onKeyPress,
}) {
  return (
    <Textarea
      placeholder="Describe your ideal portfolio design..."
      value={customDesignPrompt}
      onChange={(e) => setCustomDesignPrompt(e.target.value)}
      disabled={isGenerating}
      className="w-full h-[150px] resize-none"
      onKeyDown={onKeyPress}
    />
  );
}
