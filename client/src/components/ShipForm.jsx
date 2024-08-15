import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Fuel, Sparkles } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";
import useDisclosure from "@/hooks/useDisclosure";
import ChoosePaymentOptionDialog from "./ChoosePaymentOptionDialog";
import { AuthContext } from "@/context/AuthContext";
import LoaderOverlay from "./LoaderOverlay";
import SuccessOverlay from "./SuccessOverlay";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { pluralize } from "@/lib/utils";
import { PROMPT_PLACEHOLDERS } from "@/constants";

const ShipForm = ({ type, reset }) => {
  const [requirements, setRequirements] = useLocalStorage("requirements", "");
  const { sendMessage, socket } = useSocket();
  const [deployedWebsiteSlug, setDeployedWebsiteSlug] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isKeyValidating, setIsKeyValidating] = useState(false);

  const {
    isOpen: isLoaderOpen,
    onOpen: onLoaderOpen,
    onClose: onLoaderClose,
  } = useDisclosure();
  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();
  const { availableShips, anthropicKey, setAnthropicKey } =
    useContext(AuthContext);

  const startProject = () => {
    sendMessage("startProject", {
      shipType: "prompt",
      apiKey: anthropicKey,
      message: requirements,
    });
    onClose();
    onLoaderOpen();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!requirements.trim()) {
      toast.info("Easy there, what do you want to make?");
      return;
    }
    if (availableShips <= 0) {
      onOpen();
    } else {
      startProject();
    }
  };

  const handleSubmitAnthropicKey = (apiKey) => {
    sendMessage("anthropicKey", { anthropicKey: apiKey });
    setIsKeyValidating(true);
  };

  useEffect(() => {
    if (socket) {
      socket.on("apiKeyStatus", (response) => {
        setIsKeyValidating(false);
        if (response.success) {
          startProject();
          toast("Anthropic key is valid, starting generation!");
        } else {
          toast.error(response.message);
        }
      });

      socket.on("showPaymentOptions", ({ error }) => {
        onOpen();
      });

      socket.on("needMoreInfo", ({ message }) => {
        toast("Please add more details regarding the website");
        onLoaderClose();
      });

      socket.on("websiteDeployed", ({ slug }) => {
        onSuccessOpen();
        onLoaderClose();
        setRequirements("");
        setDeployedWebsiteSlug(slug);
      });

      return () => {
        socket.off("apiKeyStatus");
        socket.off("showPaymentOptions");
        socket.off("websiteDeployed");
        socket.off("needMoreInfo");
      };
    }
  }, [socket, anthropicKey, requirements]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="sm:text-4xl font-bold text-foreground my-8 text-2xl">
        What would you like to create today?
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <Textarea
          className="w-full h-60 bg-background text-foreground border-input mb-8"
          placeholder={PROMPT_PLACEHOLDERS[type]}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row w-full justify-between items-center space-y-4 sm:space-y-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p
                  className={`text-sm ${
                    availableShips < 1 ? "text-destructive" : "text-foreground"
                  }`}
                  onClick={(e) => e.preventDefault()}
                >
                  <Fuel className="inline-block mr-2" height={18} width={18} />
                  {availableShips} {pluralize(availableShips, "container")}{" "}
                  available
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Your balance is {availableShips}{" "}
                {pluralize(availableShips, "container")}. <br />1 container is
                equal to 1 individual project.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            type="submit"
            className="w-full sm:w-auto transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 group relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 ease-in-out bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer" />
            <span className="relative">Start generating website</span>
            <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform" />
          </Button>
        </div>
      </form>
      <ChoosePaymentOptionDialog
        isOpen={isOpen}
        onClose={onClose}
        onSubmitKey={handleSubmitAnthropicKey}
        anthropicKey={anthropicKey}
        setAnthropicKey={setAnthropicKey}
        type={type}
        isKeyValidating={isKeyValidating}
      />
      <LoaderOverlay isOpen={isLoaderOpen} type={type} />
      <SuccessOverlay
        isOpen={isSuccessOpen}
        onClose={reset}
        slug={deployedWebsiteSlug}
      />
    </div>
  );
};

export default ShipForm;
