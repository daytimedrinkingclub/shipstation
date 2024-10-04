import { Textarea } from "@/components/ui/textarea";

const CustomDesignPrompt = ({ customDesignPrompt, setCustomDesignPrompt, isGenerating }) => {
  return (
    <Textarea
      placeholder="Describe your ideal portfolio design..."
      value={customDesignPrompt}
      onChange={(e) => setCustomDesignPrompt(e.target.value)}
      disabled={isGenerating}
      className="w-full h-[150px] resize-none"
    />
  );
};

export default CustomDesignPrompt;
