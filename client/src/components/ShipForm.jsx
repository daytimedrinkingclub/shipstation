import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Fuel, Check, Edit2 } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { pluralize } from "@/lib/utils";
import { PROMPT_PLACEHOLDERS } from "@/constants";
import LoadingGameOverlay from "./LoadingGameOverlay";
import FileUpload from "./FileUpload";

import { useDispatch, useSelector } from "react-redux";
import { setPortfolioType, setUserPrompt } from "@/store/onboardingSlice";

const portfolioTypes = [
  { id: "Developer" },
  { id: "Designer" },
  { id: "Photographer" },
  { id: "Artist" },
  { id: "Musician" },
];

const ShipForm = ({ type, reset }) => {
  const { sendMessage, socket } = useSocket();
  const [deployedWebsiteSlug, setDeployedWebsiteSlug] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isKeyValidating, setIsKeyValidating] = useState(false);

  const [uploadedImages, setUploadedImages] = useState([]);
  const userPrompt = useSelector((state) => state.onboarding.userPrompt);
  const portfolioType = useSelector((state) => state.onboarding.portfolioType);

  const [customType, setCustomType] = useState("");
  const [isCustomTypeConfirmed, setIsCustomTypeConfirmed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const dispatch = useDispatch();
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

  const handleFileUpload = async ({ images }) => {
    if (images) {
      const processedImages = images.map((img) => ({
        file: img.file,
        caption: img.caption,
        mediaType: img.mediaType,
      }));
      setUploadedImages([...uploadedImages, ...processedImages]);
    }
  };

  const handlePortfolioTypeChange = (value) => {
    if (value === "Other") {
      dispatch(setPortfolioType("Other"));
      setCustomType("");
      setIsCustomTypeConfirmed(false);
      setIsEditing(true);
    } else {
      dispatch(setPortfolioType(value));
      setCustomType("");
      setIsCustomTypeConfirmed(false);
      setIsEditing(false);
    }
  };

  const handleCustomTypeChange = (e) => {
    setCustomType(e.target.value);
    setIsCustomTypeConfirmed(false);
  };

  const confirmCustomType = () => {
    if (customType.trim() !== "") {
      dispatch(setPortfolioType(customType.trim()));
      setIsCustomTypeConfirmed(true);
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setIsCustomTypeConfirmed(false);
  };

  // const startProject = () => {
  //   try {
  //     console.log("Starting project with images:", uploadedImages);
  //     sendMessage("startProject", {
  //       shipType: type,
  //       apiKey: anthropicKey,
  //       // message: requirements,
  //       images: uploadedImages.map((img) => ({
  //         file: img.file,
  //         caption: img.caption,
  //         mediaType: img.mediaType,
  //       })),
  //       portfolioType, // Add portfolioType to the message
  //     });
  //     onClose();
  //     onLoaderOpen();
  //   } catch (error) {
  //     console.error("Error starting project:", error);
  //     // Handle the error appropriately (e.g., show an error message to the user)
  //   }
  // };

  const handleSubmitAnthropicKey = (apiKey) => {
    sendMessage("anthropicKey", { anthropicKey: apiKey });
    setIsKeyValidating(true);
  };

  // useEffect(() => {
  //   if (socket) {
  //     socket.on("apiKeyStatus", (response) => {
  //       setIsKeyValidating(false);
  //       if (response.success) {
  //         startProject();
  //         toast("Anthropic key is valid, starting generation!");
  //       } else {
  //         toast.error(response.message);
  //       }
  //     });

  //     socket.on("showPaymentOptions", ({ error }) => {
  //       onOpen();
  //     });

  //     socket.on("needMoreInfo", ({ message }) => {
  //       toast("Please add more details regarding the website");
  //       onLoaderClose();
  //     });

  //     socket.on("websiteDeployed", ({ slug }) => {
  //       onSuccessOpen();
  //       onLoaderClose();
  //       setRequirements("");
  //       setDeployedWebsiteSlug(slug);
  //     });

  //     return () => {
  //       socket.off("apiKeyStatus");
  //       socket.off("showPaymentOptions");
  //       socket.off("websiteDeployed");
  //       socket.off("needMoreInfo");
  //     };
  //   }
  // }, [socket, anthropicKey, requirements]);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/");
    }
  }, [user, userLoading, navigate]);

  return (
    <div className="w-full">
      {type === "portfolio" && (
        <div className="mb-6 w-full">
          <h3 className="text-lg font-medium mb-3">Choose Portfolio Type</h3>
          <RadioGroup
            value={portfolioType === customType ? "Other" : portfolioType}
            onValueChange={handlePortfolioTypeChange}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {portfolioTypes.map((type) => (
                <div key={type.id} className="relative">
                  <RadioGroupItem
                    value={type.id}
                    id={type.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={type.id}
                    className={`flex items-center justify-center p-2 h-12 w-full rounded-md border transition-all duration-200 ease-in-out cursor-pointer ${
                      portfolioType === type.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-sm font-medium">{type.id}</span>
                  </Label>
                </div>
              ))}
              <div className="relative">
                <RadioGroupItem
                  value="Other"
                  id="Other"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="Other"
                  className={`flex items-center justify-center p-2 h-12 w-full rounded-md border transition-all duration-200 ease-in-out cursor-pointer ${
                    portfolioType === "Other" || customType !== ""
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {portfolioType === "Other" || customType !== "" ? (
                    isCustomTypeConfirmed && !isEditing ? (
                      <div className="flex items-center justify-center w-full">
                        <span className="text-sm font-medium text-center">
                          {customType}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="p-1 ml-2 hover:bg-transparent"
                          onClick={startEditing}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center w-full">
                        <Input
                          type="text"
                          className="p-2 h-8 flex-grow text-sm font-medium bg-transparent outline-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
                          placeholder="Enter your profession"
                          value={customType}
                          onChange={handleCustomTypeChange}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              confirmCustomType();
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="p-1 hover:bg-transparent"
                          onClick={confirmCustomType}
                        >
                          <Check className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )
                  ) : (
                    <span className="text-sm font-medium">Other</span>
                  )}
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}
      <form className="flex flex-col items-center">
        <Textarea
          className="w-full h-48 bg-background text-foreground border-input mb-8"
          placeholder={PROMPT_PLACEHOLDERS[type]}
          value={userPrompt}
          onChange={(e) => {
            dispatch(setUserPrompt(e.target.value));
          }}
        />

        <FileUpload onFileUpload={handleFileUpload} type={type} />
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
