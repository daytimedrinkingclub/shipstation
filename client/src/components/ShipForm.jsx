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
import { useToast } from "@/components/ui/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const ShipForm = ({ type, reset }) => {
  const [requirements, setRequirements] = useLocalStorage("requirements", "");
  const { sendMessage, socket } = useSocket();
  const [deployedWebsiteSlug, setDeployedWebsiteSlug] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isKeyValidating, setIsKeyValidating] = useState(false);

  const { toast } = useToast();
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
  }

  const handleSubmit = (e) => {
    e.preventDefault();
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
          toast({
            title: "Success",
            description: "Anthropic key is valid, starting generation!",
          });
        } else {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }
      });

      socket.on("showPaymentOptions", ({ error }) => {
        onOpen();
      });

      socket.on("needMoreInfo", ({ message }) => {
        toast({
          title: "Please add more details regarding the website",
          // description: message,
        });
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
      <h1 className="sm:text-4xl font-bold text-white my-8 text-2xl">
        What would you like to create today?
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <Textarea
          className="w-full h-60 bg-black text-white border-gray-600 mb-8"
          placeholder={`Lets start collecting your requirements for your ${type}. \n\nDescribe the layout, and confirm the needed sections.\nYou can also include brand guidelines and color palette. \n \nYou can also enter image urls in your prompt to be used as reference.`}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
        <div className="flex w-full justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className={`text-sm ${availableShips < 1 ? 'text-red-500' : 'text-white'}`} onClick={(e) => e.preventDefault()} ><Fuel className="inline-block mr-2" height={18} width={18} />{availableShips} container available</p>
              </TooltipTrigger>
              <TooltipContent>
                Your balance is {availableShips} container. <br />
                1 container is equal to 1 individual website/app.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            type="submit"
            className="transition-all duration-300 hover:bg-purple-700 hover:shadow-[0_0_10px_#8b5cf6] hover:text-purple-100 group"
          >
            Start generating website
            <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-180" />
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
      <LoaderOverlay isOpen={isLoaderOpen} />
      <SuccessOverlay
        isOpen={isSuccessOpen}
        onClose={reset}
        slug={deployedWebsiteSlug}
      />
    </div>
  );
};

export default ShipForm;
