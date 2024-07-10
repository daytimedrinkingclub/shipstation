import Lottie from "react-lottie-player";
import { useToast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { X } from "lucide-react";

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
          <button
            onClick={handledownloadzip}
            className="border border-gray-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>Download ZIP</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <div className="flex gap-4 items-center justify-center">
            <button
              onClick={() => handleCopy(link)}
              className="border border-gray-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Copy link</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button
              onClick={() => window.open(link, "_blank")}
              className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Visit now</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessOverlay;
