import React, { useCallback } from "react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import {
  Code2,
  Paintbrush,
  Camera,
  Palette,
  Music,
  Briefcase,
  Fuel,
  Check,
  Edit2,
} from "lucide-react";
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
  { id: "Developer", icon: Code2 },
  { id: "Designer", icon: Paintbrush },
  { id: "Photographer", icon: Camera },
  { id: "Artist", icon: Palette },
  { id: "Musician", icon: Music },
];

const ShipForm = ({ reset, isGenerating, onFileUpload }) => {
  const { sendMessage, socket } = useSocket();
  const [deployedWebsiteSlug, setDeployedWebsiteSlug] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isKeyValidating, setIsKeyValidating] = useState(false);

  const [uploadedImages, setUploadedImages] = useState([]);
  const userPrompt = useSelector((state) => state.onboarding.userPrompt);
  const portfolioType = useSelector((state) => state.onboarding.portfolioType);
  const shipType = useSelector((state) => state.onboarding.shipType);

  const [customType, setCustomType] = useState("");
  const [isCustomTypeConfirmed, setIsCustomTypeConfirmed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, userLoading, availableShips, anthropicKey, setAnthropicKey } =
    useContext(AuthContext);

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

  const handleFileUpload = useCallback(
    (files) => {
      onFileUpload(files);
    },
    [onFileUpload]
  );

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/");
    }
  }, [user, userLoading, navigate]);

  return (
    <div className="w-full flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        Tell us about your new website
      </h2>
      {shipType === "portfolio" && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-foreground">
            Choose Portfolio Type
          </h3>
          <RadioGroup
            value={portfolioType === customType ? "Other" : portfolioType}
            onValueChange={handlePortfolioTypeChange}
            disabled={isGenerating}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {portfolioTypes.map(({ id, icon }) => {
                const IconComponent = icon;
                return (
                  <div key={id} className="relative">
                    <RadioGroupItem
                      value={id}
                      id={id}
                      className="peer sr-only"
                      disabled={isGenerating}
                    />
                    <Label
                      htmlFor={id}
                      className={`flex items-center justify-center p-2 h-12 w-full rounded-md border transition-all duration-200 ease-in-out ${
                        isGenerating
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      } ${
                        portfolioType === id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">{id}</span>
                    </Label>
                  </div>
                );
              })}
              <div className="relative">
                <RadioGroupItem
                  value="Other"
                  id="Other"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="Other"
                  className={`flex items-center justify-center p-2 h-12 w-full rounded-md border transition-all duration-200 ease-in-out ${
                    isGenerating
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  } ${
                    portfolioType === "Other" || customType !== ""
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {portfolioType === "Other" || customType !== "" ? (
                    isCustomTypeConfirmed && !isEditing ? (
                      <div className="flex items-center justify-center w-full">
                        <Briefcase className="h-5 w-5 mr-2" />
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
                        <Briefcase className="h-5 w-5 mr-2" />
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
                    <>
                      <Briefcase className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Other</span>
                    </>
                  )}
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}
      <div className="flex flex-col flex-grow">
        <Textarea
          className="flex-grow bg-background text-foreground border-input mb-4 h-40"
          placeholder={PROMPT_PLACEHOLDERS[shipType]}
          value={userPrompt}
          disabled={isGenerating}
          onChange={(e) => {
            dispatch(setUserPrompt(e.target.value));
          }}
        />
        <div className="mt-auto">
          <FileUpload onFileUpload={handleFileUpload} type={shipType} />
          <div className="flex justify-between items-center mt-4">
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p
                    className={`text-sm ${
                      availableShips < 1
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                    onClick={(e) => e.preventDefault()}
                  >
                    <Fuel
                      className="inline-block mr-2"
                      height={18}
                      width={18}
                    />
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
            </TooltipProvider> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipForm;
