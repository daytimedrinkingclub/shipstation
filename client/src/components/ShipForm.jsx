import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Fuel } from "lucide-react";
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
import LoadingGameOverlay from "./LoadingGameOverlay";
import ImageUpload from "./ImageUpload";

const ShipForm = ({ type, reset }) => {
  const [requirements, setRequirements] = useLocalStorage("requirements", "");
  const { sendMessage, socket } = useSocket();
  const [deployedWebsiteSlug, setDeployedWebsiteSlug] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isKeyValidating, setIsKeyValidating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const navigate = useNavigate();
  const { user, userLoading, availableShips, anthropicKey, setAnthropicKey } =
    useContext(AuthContext);

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

  const handleImageUpload = (imageData) => {
    setUploadedImages(
      imageData.map((img) => ({
        file: img.file,
        caption: img.caption,
        mediaType: img.mediaType,
      }))
    );
  };

  const startProject = () => {
    try {
      console.log("Starting project with images:", uploadedImages);
      sendMessage("startProject", {
        shipType: type,
        apiKey: anthropicKey,
        message: requirements,
        images: uploadedImages.map((img) => ({
          file: img.file,
          caption: img.caption,
          mediaType: img.mediaType,
        })),
      });
      onClose();
      onLoaderOpen();
    } catch (error) {
      console.error("Error starting project:", error);
      // Handle the error appropriately (e.g., show an error message to the user)
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

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/");
    }
  }, [user, userLoading, navigate]);

  return (
    <div className="w-full">
      <form className="flex flex-col items-center">
        <Textarea
          className="w-full h-32 bg-background text-foreground border-input mb-8"
          placeholder={PROMPT_PLACEHOLDERS[type]}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
        <ImageUpload onImageUpload={handleImageUpload} />
        <div className="flex flex-col sm:flex-row w-full justify-between items-center space-y-4 sm:space-y-0 mt-4">
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
      {isLoaderOpen && <LoadingGameOverlay isOpen={isLoaderOpen} type={type} />}
      <SuccessOverlay
        isOpen={isSuccessOpen}
        onClose={reset}
        slug={deployedWebsiteSlug}
      />
    </div>
  );
};

export default ShipForm;
