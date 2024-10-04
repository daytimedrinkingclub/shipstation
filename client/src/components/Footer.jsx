import { useState, useEffect } from "react";
import { Star, HelpCircle, Scale, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Lottie from "react-lottie-player";
import indiaAnimation from "@/assets/lottie/india.json";
import { toast } from "sonner";
import EmojiOverlay from "@/components/random/EmojiOverlay"; // Import the EmojiOverlay component

const Footer = () => {
  const [showEmojiOverlay, setShowEmojiOverlay] = useState(false);

  const handleFlagClick = () => {
    toast.success("Jai Hind! 🇮🇳", {
      description: "Proud to be Indian!",
    });
    setShowEmojiOverlay(true);

    // Hide the overlay after 3 seconds
    setTimeout(() => {
      setShowEmojiOverlay(false);
    }, 3000);
  };

  return (
    <footer className="p-4 flex justify-center container">
      <div className="flex items-center gap-4 flex-wrap justify-end">
        <a
          href="mailto:anuj@daytimedrinkingclub.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <HelpCircle height={16} width={16} />
          Help and Support
        </a>
        <a
          href="https://github.com/daytimedrinkingclub/shipstation"
          target="_blank"
          className="text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <Star height={16} width={16} />
          Star us on GitHub
        </a>
        <a
          href="https://discord.gg/wMNmcmq3SX"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <Ship height={16} width={16} />
          Join us on Discord
        </a>
      </div>
    </footer>
  );
};

export default Footer;