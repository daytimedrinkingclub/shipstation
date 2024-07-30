import Lottie from "react-lottie-player";
import { Button } from "./ui/button";
import { CodeXml, ExternalLinkIcon, FolderOpen, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const SuccessOverlay = ({ isOpen, onClose, slug }) => {
  const navigate = useNavigate();

  const successText = `Your website "${slug}" is live!`;
  const link = `${import.meta.env.VITE_BACKEND_URL}/site/${slug}/`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast("Link copied to clipboard");
  };

  const handledownloadzip = () => {
    const zipLink = `${import.meta.env.VITE_BACKEND_URL}/download/${slug}`;
    window.open(zipLink, "_blank");
  };

  const handleEditProject = () => {
    navigate(`/project/${slug}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black text-white p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {successText}
          </DialogTitle>
        </DialogHeader>
        <div className="absolute inset-0 w-full h-full -z-10">
          <Lottie
            play
            path="https://assets9.lottiefiles.com/packages/lf20_u4yrau.json"
            loop={false}
          />
        </div>
        <div className="mt-4 flex justify-between gap-4">
          <Button
            onClick={handleEditProject}
            variant="secondary"
            className="w-full"
          >
            <CodeXml className="w-4 h-4 mr-2" />
            Open Editor
          </Button>
          <Button
            onClick={() => window.open(link, "_blank")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>Visit now</span>
            <ExternalLinkIcon className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessOverlay;
