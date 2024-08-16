import Lottie from "react-lottie-player";
import { Button } from "./ui/button";
import { CodeXml, ExternalLinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const SuccessOverlay = ({ isOpen, onClose, slug }) => {
  const navigate = useNavigate();

  const successText = `Your website "${slug}" is live!`;
  const link = `${import.meta.env.VITE_BACKEND_URL}/site/${slug}/`;

  const handleEditProject = () => {
    navigate(`/project/${slug}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
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
        <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
          <Button onClick={handleEditProject} className="w-full" variant="outline">
            <CodeXml className="w-4 h-4 mr-2" />
            Open Editor
          </Button>
          <Button
            onClick={() => window.open(link, "_blank")}
            className="w-full"
          >
            <span>Visit now</span>
            <ExternalLinkIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessOverlay;
