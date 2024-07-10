import Lottie from "react-lottie-player";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { Copy, Download, ExternalLinkIcon, X } from "lucide-react";

const SuccessOverlay = ({ isOpen, onClose, slug }) => {
  if (!isOpen) return null;
  const { toast } = useToast();

  const successText = `Your website "${slug}" has been deployed successfully!`;
  const link = `${import.meta.env.VITE_BACKEND_URL}/site/${slug}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Link copied to clipboard",
    });
  };

  const handledownloadzip = () => {
    const zipLink = `${import.meta.env.VITE_BACKEND_URL}/download/${slug}`;
    window.open(zipLink, "_blank");
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 backdrop-filter backdrop-blur-md z-[9999] overflow-hidden">
      <Button
        onClick={onClose}
        className="absolute top-4 text-white right-4  transition-colors duration-300 z-20"
        variant="ghost"
        size="icon"
      >
        <X className="w-10 h-10" />
      </Button>
      <div className="absolute inset-0 w-full h-full">
        <Lottie
          play
          path="https://assets9.lottiefiles.com/packages/lf20_u4yrau.json"
          loop={false}
        />
      </div>

      <div className="text-center relative z-10 bg-gray-900 bg-opacity-95 max-w-3xl border border-gray-700 rounded">
        <p className="text-2xl font-semibold m-8 p-4 text-white">
          {successText}
        </p>
        <div className="my-8 px-8 space-x-4 flex justify-between">
          <div className="flex gap-4 items-center justify-center">
            <button
              onClick={handledownloadzip}
              className="border border-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Download ZIP</span>
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleCopy(link)}
              className="border border-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Copy link</span>
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-4 items-center justify-center">

            <button
              onClick={() => window.open(link, "_blank")}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Visit now</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessOverlay;
