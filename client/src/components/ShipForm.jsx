import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Ship } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";
import useDisclosure from "@/hooks/useDisclosure";
import ChoosePaymentOptionDialog from "./ChoosePaymentOptionDialog";
import { AuthContext } from "@/context/AuthContext";
import LoaderOverlay from "./LoaderOverlay";
import SuccessOverlay from "./SuccessOverlay";
import { useToast } from "@/components/ui/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";


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
    };
  }, [anthropicKey, requirements]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-white mb-6">
        What will you ship today?
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <Textarea
          className="w-full h-40 bg-black text-white border-gray-600 mb-4"
          placeholder={`Enter your ${type} requirements...\nDescribe the layout, sections, and copy in detail.\nYou can also include brand guidelines and color palette.`}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
        <Button type="submit" className="bg-white text-black hover:bg-gray-200">
          Ship it! <Ship className="ml-2 h-4 w-4" />
        </Button>
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
